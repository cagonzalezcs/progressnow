/* GET /api/health — liveness for load balancers and the deployment smoke test
 * (openspec next-revalidation-receiver § Health endpoint). Never contacts
 * WordPress. */
export function GET(): Response {
  return Response.json(
    { ok: true, buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev" },
    { headers: { "cache-control": "no-store" } },
  );
}
