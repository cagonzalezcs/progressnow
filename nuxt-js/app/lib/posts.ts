import { reactive, watchSyncEffect } from "vue";

import { EVENT_CATEGORIES, type EventCategory } from "@/lib/events";

/* Contract types live in lib/schemas.ts (zod, one definition point). */
export type {
  BlogPost,
  PostBlock,
  PostCat,
  PostImage,
  SinglePostData,
} from "@/lib/schemas";

/* Post categories share the event taxonomy colors; only the "all" label
 * differs. Kept in sync with the reactive store in lib/events.ts so
 * setCategories() updates blog chips too. */
export const POST_CATEGORIES: EventCategory[] = reactive([]);
watchSyncEffect(() => {
  POST_CATEGORIES.splice(
    0,
    POST_CATEGORIES.length,
    ...EVENT_CATEGORIES.map((c) => (c.id === "all" ? { ...c, label: "All posts" } : c)),
  );
});

export function postCategoryById(id: string): EventCategory {
  return POST_CATEGORIES.find((c) => c.id === id) ?? POST_CATEGORIES[0];
}
