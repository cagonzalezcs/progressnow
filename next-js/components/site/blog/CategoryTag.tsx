import { SiteLink } from "@/components/site/SiteLink";
import { categoryById, postCategories } from "@/lib/categories";
import type { EventCategory } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Category label on v4 tokens (openspec progress-now-v4-blog task 3.2): every
 * category reads brand blue.
 *   solid — brand pill, white text · white — white pill, brand text · text — bare brand label */
export interface CategoryTagProps {
  catId: string;
  href?: string;
  variant?: "solid" | "white" | "text";
  size?: "sm" | "md";
  /** `/site.categories` (WordPress overrides); registry defaults otherwise. */
  categories?: EventCategory[] | null;
  wpOrigin?: string;
}

export function CategoryTag({
  catId,
  href = "",
  variant = "solid",
  size = "md",
  categories,
  wpOrigin = "",
}: CategoryTagProps) {
  const category = categoryById(catId, postCategories(categories));
  const variantClass = {
    solid: "rounded-full bg-brand text-white",
    white: "rounded-full bg-white text-brand",
    text: "text-brand",
  }[variant];
  const sizeClass =
    variant === "text"
      ? size === "sm"
        ? "text-[0.72rem]"
        : "text-[0.78rem]"
      : size === "sm"
        ? "px-3 py-1 text-[0.72rem]"
        : "px-3.5 py-[5px] text-[0.78rem]";
  const className = cn(
    "category-tag inline-block self-start font-bold uppercase tracking-[0.06em] no-underline",
    variantClass,
    sizeClass,
    href && "hover:underline hover:underline-offset-4",
  );
  if (href) {
    return (
      <SiteLink
        href={href}
        wpOrigin={wpOrigin}
        className={className}
        data-testid="category-tag"
        data-category={catId}
      >
        {category.label}
      </SiteLink>
    );
  }
  return (
    <span className={className} data-testid="category-tag" data-category={catId}>
      {category.label}
    </span>
  );
}
