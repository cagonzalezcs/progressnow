import { BlockActionCallout } from "@/components/site/blog/blocks/BlockActionCallout";
import { BlockAudio } from "@/components/site/blog/blocks/BlockAudio";
import { BlockDocument } from "@/components/site/blog/blocks/BlockDocument";
import { BlockEventEmbed } from "@/components/site/blog/blocks/BlockEventEmbed";
import { BlockGallery } from "@/components/site/blog/blocks/BlockGallery";
import { BlockImage } from "@/components/site/blog/blocks/BlockImage";
import { BlockPersonQuote } from "@/components/site/blog/blocks/BlockPersonQuote";
import { BlockProse } from "@/components/site/blog/blocks/BlockProse";
import { BlockPullQuote } from "@/components/site/blog/blocks/BlockPullQuote";
import { BlockVideo } from "@/components/site/blog/blocks/BlockVideo";
import { ensureHeadingIds } from "@/lib/post";
import type { EventCategory, PostBlock } from "@/lib/schemas";

/* post_blocks flexible-content stack (openspec progress-now-v4-blog task 4.3):
 * every block reads the brand role tokens. Twin of PostBlocks.vue. */
export function PostBlocks({
  blocks,
  categories,
  calendarHref,
  wpOrigin,
}: {
  blocks: PostBlock[];
  categories?: EventCategory[] | null;
  calendarHref: string;
  wpOrigin: string;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        switch (block.type) {
          case "prose":
            return <BlockProse key={key} html={ensureHeadingIds(block.html)} />;
          case "image":
            return <BlockImage key={key} image={block.image} breakout={block.breakout} />;
          case "pull_quote":
            return <BlockPullQuote key={key} quote={block.quote} attribution={block.attribution} />;
          case "gallery":
            return <BlockGallery key={key} layout={block.layout} images={block.images} />;
          case "person_quote":
            return (
              <BlockPersonQuote
                key={key}
                photo={block.photo}
                alt={block.alt}
                quote={block.quote}
                translation={block.translation}
                name={block.name}
                role={block.role}
                lang={block.lang}
              />
            );
          case "video":
            return (
              <BlockVideo
                key={key}
                url={block.url}
                poster={block.poster}
                caption={block.caption}
                transcriptUrl={block.transcriptUrl}
              />
            );
          case "audio":
            return (
              <BlockAudio
                key={key}
                file={block.file}
                title={block.title}
                duration={block.duration}
                transcriptUrl={block.transcriptUrl}
              />
            );
          case "document":
            return (
              <BlockDocument
                key={key}
                url={block.url}
                title={block.title}
                description={block.description}
              />
            );
          case "event_embed":
            return (
              <BlockEventEmbed
                key={key}
                event={block.event}
                categories={categories}
                calendarHref={calendarHref}
                wpOrigin={wpOrigin}
              />
            );
          case "action_callout":
            return (
              <BlockActionCallout
                key={key}
                heading={block.heading}
                body={block.body}
                buttons={block.buttons}
                wpOrigin={wpOrigin}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
