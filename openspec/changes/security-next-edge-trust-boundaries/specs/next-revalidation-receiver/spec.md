## ADDED Requirements

### Requirement: Body size is enforced while streaming
The receiver SHALL stop reading the request body once 16 KB have been received, regardless of the `Content-Length` header, answer 413, and SHALL require `Content-Type: application/json` (415 otherwise) before verifying the signature.

#### Scenario: Chunked oversized body
- **WHEN** a request without `Content-Length` streams 1 MB
- **THEN** the receiver answers 413 after at most 16 KB and buffers no more

#### Scenario: Wrong content type
- **WHEN** a signed request arrives as `text/plain`
- **THEN** the receiver answers 415 and invalidates nothing
