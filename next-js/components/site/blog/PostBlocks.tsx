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
import type { EventCategory, PostBlock } from "@/lib/schemas";

/* post_blocks flexible-content dispatcher (openspec gutenberg-post-blocks
 * § block serialization; v4: every block reads the brand role tokens). Server
 * component — only audio and video mount client islands. */
export function PostBlocks({
  blocks,
  categories,
  calendarUrl,
  wpOrigin,
}: {
  blocks: PostBlock[];
  categories?: EventCategory[] | null;
  calendarUrl?: string;
  wpOrigin: string;
}) {
  return blocks.map((block, i) => {
    const key = `${block.type}-${i}`;
    switch (block.type) {
      case "prose":
        return <BlockProse key={key} html={block.html} />;
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
            wpOrigin={wpOrigin}
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
            wpOrigin={wpOrigin}
          />
        );
      case "document":
        return (
          <BlockDocument
            key={key}
            url={block.url}
            title={block.title}
            description={block.description}
            wpOrigin={wpOrigin}
          />
        );
      case "event_embed":
        return (
          <BlockEventEmbed
            key={key}
            event={block.event}
            categories={categories}
            calendarUrl={calendarUrl}
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
    }
  });
}
