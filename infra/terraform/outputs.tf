output "s3_bucket" {
  description = "Bucket the rebuild workflow syncs into (repository variable S3_BUCKET)."
  value       = aws_s3_bucket.site.bucket
}

output "aws_role_arn" {
  description = "GitHub OIDC deploy role (repository variable AWS_ROLE_ARN)."
  value       = aws_iam_role.deploy.arn
}

output "cloudfront_distribution_id" {
  description = "Distribution id for invalidations (repository variable CLOUDFRONT_DISTRIBUTION_ID); empty in same-host mode."
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.site[0].id : ""
}

output "cloudfront_domain_name" {
  description = "Point site_domain's DNS (ALIAS/CNAME) here in CDN mode."
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.site[0].domain_name : ""
}

output "github_variables" {
  description = "Repository variables to set for .github/workflows/rebuild-site.yml."
  value = {
    STATIC_DEPLOY_TARGET       = "s3"
    AWS_REGION                 = var.aws_region
    AWS_ROLE_ARN               = aws_iam_role.deploy.arn
    S3_BUCKET                  = aws_s3_bucket.site.bucket
    CLOUDFRONT_DISTRIBUTION_ID = var.enable_cloudfront ? aws_cloudfront_distribution.site[0].id : ""
    WP_API_BASE                = "https://${var.site_domain}/wp-json/progressnow/v1"
    WP_BUILD_STATUS_URL        = "https://${var.site_domain}/wp-json/progressnow/v1/build-status"
  }
}
