import SellerProfile from "apps/user-ui/src/shared/modules/seller/seller-profile";
import { getImageUrl } from "apps/user-ui/src/utils/image";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

const DEFAULT_SHOP_IMAGE =
  "https://ik.imagekit.io/bigwavehaibuithe/products/ShoppingCart.png?updatedAt=1757342740267";

async function fetchSellerDetails(id: string) {
  const response = await axiosInstance.get(`/seller/api/get-seller/${id}`);
  return response.data;
}

// Dynamic metadata generator
export async function generateMetaData({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchSellerDetails(params.id);
  const avatarUrl = getImageUrl(data?.shop?.avatar, DEFAULT_SHOP_IMAGE);

  return {
    title: `${data?.shop?.name} | Ecommerce Shop Marketplace`,
    description:
      data?.shop?.bio ||
      "Explore products and services from sellers on Ecommerce Shop.",
    openGraph: {
      title: `${data?.shop?.name} | Ecommerce Shop Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore products and services from sellers on Ecommerce Shop.",
      type: "website",
      images: [
        {
          url: avatarUrl,
          width: 800,
          height: 600,
          alt: data?.shop?.name || "Shop Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data?.shop?.name} | Ecommerce Shop Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore products and services from sellers on Ecommerce Shop.",
      images: [avatarUrl],
    },
  };
}

const Page= async({ params }: { params: { id: string } }) => {
  const data=await fetchSellerDetails(params.id);
  return <div>
    <SellerProfile shop={data?.shop} followersCount={data?.followersCount}  />
  </div>;
};

export default Page;
