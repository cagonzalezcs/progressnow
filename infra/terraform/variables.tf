variable "aws_region" {
  description = "Region for the S3 bucket and IAM resources."
  type        = string
  default     = "us-east-1"
}

variable "name" {
  description = "Resource name prefix (bucket, role, distribution comment)."
  type        = string
  default     = "progressnow-site"
}

variable "site_domain" {
  description = "The public site domain, e.g. example.org (WordPress is served here; CloudFront fronts it in CDN mode)."
  type        = string
}

variable "wordpress_origin_domain" {
  description = "Hostname CloudFront reaches WordPress at in CDN mode (e.g. origin.example.org). Ignored when enable_cloudfront is false."
  type        = string
  default     = ""
}

variable "enable_cloudfront" {
  description = "CDN mode: one CloudFront distribution fronts the domain — static paths → S3 (OAC), everything else → WordPress (openspec design D2). false = same-host mode (S3 is then just an optional deploy target)."
  type        = bool
  default     = false
}

variable "acm_certificate_arn" {
  description = "ACM certificate (us-east-1) covering site_domain, required when enable_cloudfront is true."
  type        = string
  default     = ""
}

variable "enable_origin_failover" {
  description = "In CDN mode, serve the prerendered HTML from S3 when WordPress returns 5xx (origin group failover)."
  type        = bool
  default     = false
}

variable "github_repository" {
  description = "owner/repo whose rebuild-site workflow may deploy (GitHub OIDC trust)."
  type        = string
}

variable "github_oidc_subjects" {
  description = "Allowed OIDC subject claims. Default: any ref of the repository (workflow_dispatch/repository_dispatch run on the default branch)."
  type        = list(string)
  default     = []
}

variable "create_github_oidc_provider" {
  description = "Create the token.actions.githubusercontent.com OIDC provider (one per AWS account). Set false if it already exists."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags applied to every resource."
  type        = map(string)
  default     = {}
}
