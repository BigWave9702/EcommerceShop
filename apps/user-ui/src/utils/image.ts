export type ImageLike = string | { url?: string | null } | null | undefined;

export const getImageUrl = (image: ImageLike, fallback: string) => {
  if (typeof image === "string") {
    return image || fallback;
  }

  return image?.url || fallback;
};
