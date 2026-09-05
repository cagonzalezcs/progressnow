/* WordPress wysiwyg content — kses-sanitized server-side (same trust boundary
 * as the Vue `v-html`; openspec next-accessibility § Content semantics). */
export function BlockProse({ html }: { html: string }) {
  return (
    <div
      className="block-prose prose-chapter prose-post w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
