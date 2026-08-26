export type ImageLike = string | { url?: string | null } | null | undefined;

export const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/800x800?text=Product";

export const getImageUrl = (image: ImageLike, fallback: string) => {
  if (typeof image === "string") {
    return image || fallback;
  }

  return image?.url || fallback;
};
