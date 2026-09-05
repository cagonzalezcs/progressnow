import { notFound } from "next/navigation";
import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";
import { getPost } from "@/lib/data";
import { payloadSlug } from "@/lib/routes";

export async function RoutePost({ resolved }: RouteProps) {
  const post = resolved.route ? await getPost(payloadSlug(resolved.route), resolved.lang) : null;
  if (!post) notFound();
  return <Placeholder kind="post" title={post.title} />;
}
