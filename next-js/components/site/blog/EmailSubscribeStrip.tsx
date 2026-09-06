import { SubscribeStrip } from "@/components/site/SubscribeStrip";

/* Blog subscribe strip (openspec progress-now-v4-blog D5): the shared ink
 * SubscribeStrip with the blog's copy from `/site.strings` (blog_subscribe_*).
 * No form — hands off to the chapter's newsletter URL; nothing without one. */
export function EmailSubscribeStrip({
  newsletterUrl = "",
  title = "Never miss a post",
  lede = "One email when we publish. No spam, no lists sold — ever.",
  label = "Subscribe",
}: {
  newsletterUrl?: string;
  title?: string;
  lede?: string;
  label?: string;
}) {
  return (
    <SubscribeStrip
      id="subscribe"
      className="email-subscribe-strip"
      href={newsletterUrl}
      title={title}
      lede={lede}
      label={label}
      testId="email-subscribe-strip"
    />
  );
}
