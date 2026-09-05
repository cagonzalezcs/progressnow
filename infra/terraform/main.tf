# Reference infrastructure for the static rendition (openspec design D2/D7).
# Provided for the operator; not applied by the change. Two modes:
#
#   same-host (enable_cloudfront = false)
#     The web server serves /_nuxt, _payload.json and shell-manifest.json from
#     CHAPTER_STATIC_DIR on the WordPress host (rsync deploy). The bucket is an
#     optional deploy/inspection target; nothing here needs to exist.
#
#   CDN (enable_cloudfront = true)
#     One CloudFront distribution on site_domain: the static paths → private S3
#     (origin access control), the default behaviour → WordPress, honouring
#     origin cache headers and forwarding cookies/Authorization/query strings.
#     DNS for site_domain then points at the distribution.
#
# The GitHub OIDC role lets .github/workflows/rebuild-site.yml sync the bucket
# and invalidate the distribution without long-lived keys.

locals {
  static_path_patterns = ["/_nuxt/*", "/shell-manifest.json", "/_payload.json", "*/_payload.json"]

  # AWS managed policies (stable ids, see CloudFront docs).
  cache_policy_caching_optimized     = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  cache_policy_use_origin_headers_qs = "4cc15a8a-d715-48a4-82b8-cc0b614638fe"
  origin_request_policy_all_viewer   = "216adef6-5c7f-47e4-b989-5492eafa07d3"

  oidc_subjects = length(var.github_oidc_subjects) > 0 ? var.github_oidc_subjects : ["repo:${var.github_repository}:*"]
}

# ---- S3: the generated site --------------------------------------------------

resource "aws_s3_bucket" "site" {
  bucket        = var.name
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Keep a short history of builds for rollback (docs/deployment.md), not forever.
resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket     = aws_s3_bucket.site.id
  depends_on = [aws_s3_bucket_versioning.site]

  rule {
    id     = "expire-old-builds"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# ---- CloudFront (CDN mode) ---------------------------------------------------

resource "aws_cloudfront_origin_access_control" "site" {
  count                             = var.enable_cloudfront ? 1 : 0
  name                              = "${var.name}-oac"
  description                       = "Static rendition bucket access"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  comment             = "${var.name}: WordPress shell + static rendition"
  aliases             = [var.site_domain]
  price_class         = "PriceClass_100"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  default_root_object = ""
  tags                = var.tags

  origin {
    origin_id                = "static"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site[0].id
  }

  origin {
    origin_id   = "wordpress"
    domain_name = var.wordpress_origin_domain

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Forwarded-Host"
      value = var.site_domain
    }
  }

  dynamic "origin_group" {
    for_each = var.enable_origin_failover ? [1] : []
    content {
      origin_id = "wordpress-with-failover"
      failover_criteria {
        status_codes = [500, 502, 503, 504]
      }
      member {
        origin_id = "wordpress"
      }
      member {
        origin_id = "static"
      }
    }
  }

  # Default: WordPress (PHP shells, REST, admin). Origin cache headers rule;
  # every header/cookie/query string reaches WordPress.
  default_cache_behavior {
    target_origin_id         = var.enable_origin_failover ? "wordpress-with-failover" : "wordpress"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = local.cache_policy_use_origin_headers_qs
    origin_request_policy_id = local.origin_request_policy_all_viewer
  }

  # Static paths: the private bucket, cached by the object's own Cache-Control
  # (immutable for /_nuxt, 60 s for payloads and the manifest).
  dynamic "ordered_cache_behavior" {
    for_each = local.static_path_patterns
    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = "static"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      cache_policy_id        = local.cache_policy_caching_optimized
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  lifecycle {
    precondition {
      condition     = var.wordpress_origin_domain != "" && var.acm_certificate_arn != ""
      error_message = "CDN mode needs wordpress_origin_domain and acm_certificate_arn."
    }
  }
}

data "aws_iam_policy_document" "bucket" {
  count = var.enable_cloudfront ? 1 : 0

  statement {
    sid       = "CloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site[0].arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.bucket[0].json
}

# ---- GitHub OIDC deploy role -------------------------------------------------

data "aws_caller_identity" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  count           = var.create_github_oidc_provider ? 1 : 0
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # ignored by AWS for GitHub since 2023, still required by the API
  tags            = var.tags
}

locals {
  github_oidc_provider_arn = var.create_github_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [local.github_oidc_provider_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.oidc_subjects
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "${var.name}-github-deploy"
  assume_role_policy = data.aws_iam_policy_document.assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "ListBucket"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [aws_s3_bucket.site.arn]
  }
  statement {
    sid       = "SyncObjects"
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }
  dynamic "statement" {
    for_each = var.enable_cloudfront ? [1] : []
    content {
      sid       = "Invalidate"
      actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
      resources = [aws_cloudfront_distribution.site[0].arn]
    }
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "${var.name}-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
