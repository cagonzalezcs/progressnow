import { BlockA11yNote } from "@/components/site/BlockA11yNote";
import { BlockAgenda } from "@/components/site/BlockAgenda";
import { BlockGoodToKnow } from "@/components/site/BlockGoodToKnow";
import { BlockMap } from "@/components/site/BlockMap";
import { BlockProse } from "@/components/site/blog/blocks/BlockProse";
import type { EventBlock } from "@/lib/schemas";

/* event_body flexible-content dispatcher (mirrors PostBlocks). Every block
 * reads the brand role tokens; `strings` supplies translated headings. */
export function EventBlocks({
  blocks,
  headings,
}: {
  blocks: EventBlock[];
  headings?: { agenda?: string; goodToKnow?: string; a11yNote?: string; map?: string };
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "prose":
            return <BlockProse key={i} html={block.html} />;
          case "agenda":
            return <BlockAgenda key={i} items={block.items} heading={headings?.agenda} />;
          case "good_to_know":
            return <BlockGoodToKnow key={i} items={block.items} heading={headings?.goodToKnow} />;
          case "a11y_note":
            return <BlockA11yNote key={i} html={block.html} heading={headings?.a11yNote} />;
          case "map":
            return <BlockMap key={i} address={block.address} heading={headings?.map} />;
        }
      })}
    </>
  );
}
