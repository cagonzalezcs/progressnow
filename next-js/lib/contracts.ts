import type { z } from "zod";
import type { languageLinkSchema } from "@/lib/schemas";

/* Derived types the drift-guarded schemas.ts does not export itself. */
export type LanguageLink = z.infer<typeof languageLinkSchema>;
