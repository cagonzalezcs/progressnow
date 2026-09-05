# Reference AWS infrastructure (optional)

Terraform for the static rendition's deploy target (openspec design D2/D7).
It is a reference, not something the theme depends on: same-host mode needs
none of it. Use it when you want a private S3 bucket for the build, a GitHub
OIDC role for the rebuild workflow, and optionally CloudFront in front of the
domain.

```hcl
module "site" {
  source = "./infra/terraform"

  name              = "progressnow-site"
  site_domain       = "example.org"
  github_repository = "owner/repo"

  # CDN mode (optional)
  enable_cloudfront       = true
  wordpress_origin_domain = "origin.example.org"   # WordPress host, not the CDN'd domain
  acm_certificate_arn     = "arn:aws:acm:us-east-1:…:certificate/…"
}
```

```bash
terraform init && terraform validate && terraform plan
terraform apply
terraform output github_variables   # paste into Settings → Variables
```

What it creates:

- `aws_s3_bucket` — private (public access blocked, bucket-owner-enforced),
  versioned, non-current builds expire after 30 days.
- `aws_cloudfront_distribution` (CDN mode) — `/_nuxt/*`, `/_payload.json`,
  `*/_payload.json`, `/shell-manifest.json` → the bucket via origin access
  control with the *CachingOptimized* policy (objects carry their own
  `Cache-Control`: immutable for `/_nuxt`, 60 s otherwise); everything else →
  WordPress with *UseOriginCacheControlHeaders-QueryStrings* + *AllViewer*, so
  cookies, `Authorization` and query strings pass through and the shell's own
  cache headers rule. Optional origin-group failover serves the prerendered
  HTML when WordPress answers 5xx. HTTPS redirect, HTTP/2 + HTTP/3, compression.
- `aws_iam_role` — trusted by GitHub's OIDC provider for `repo:<owner/repo>:*`
  (narrow with `github_oidc_subjects`), allowed to sync the bucket and, in CDN
  mode, create invalidations on this distribution only.

Not created: DNS records (point `site_domain` at `cloudfront_domain_name`),
the ACM certificate (request it in us-east-1), the WordPress host.

This module has not been applied by the change; run `terraform validate` in
your root module before the first plan.
