import { type JsonLdNode, jsonLdGraph, serializeJsonLd } from "@/lib/json-ld";

/* One <script type="application/ld+json"> per graph (openspec spec
 * structured-data). Server component; `nonce` arrives with the CSP (task 8.1).
 * Renders nothing when every node is null. */
export function JsonLd({
  nodes,
  nonce,
  id,
}: {
  nodes: (JsonLdNode | null)[];
  nonce?: string;
  id?: string;
}) {
  const graph = jsonLdGraph(nodes);
  if (graph["@graph"].length === 0) return null;
  return (
    <script
      type="application/ld+json"
      id={id}
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
    />
  );
}
