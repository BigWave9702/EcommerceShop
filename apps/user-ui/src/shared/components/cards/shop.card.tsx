import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { getImageUrl, ImageLike } from "apps/user-ui/src/utils/image";

const DEFAULT_SHOP_AVATAR =
  "https://scontent.fhan5-11.fna.fbcdn.net/v/t39.30808-1/423693810_713409194268423_4424368522200979225_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=100&ccb=1-7&_nc_sid=2d3e12&_nc_eui2=AeEL2Ow7HSU7HKECfSIX48PUmMSEW8y8K5OYxIRbzLwrk_fWAreFhsN4aFEzfGZ5OeGnbJ_bsFUXIA5VZuId3hhp&_nc_ohc=7kZ2LUIAz3MQ7kNvwE-OEK5&_nc_oc=AdoL2g3M1luLO5jeEK51bh1POlQ99VxTIsyDK1nk6ZCwrMSOmAydyi-mFUz3jWQCzmM&_nc_zt=24&_nc_ht=scontent.fhan5-11.fna&_nc_gid=AXmnVxB7ZjXqGCuoKfIviw&_nc_ss=7c2a8&oh=00_Af65cY1V_f1H7L-svPVSyCFm50umW4Ji9-Tv1Eeot_ZeSA&oe=6A143F3A";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: ImageLike;
    coverBanner?: string;
    address?: string;
    followers?: string;
    rating?: number;
    category?: string;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition">
      {/* Cover */}
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://www.sweelee.com.vn/cdn/shop/files/SLVN_Heritage_Standard_II_desktop-slideshow_2700x810_9bd9b932-ff2a-401a-8f9b-5369b8089689_1110x333_crop_top.jpg?v=1778557388"
          }
          alt="Cover"
          fill
          className="object-cover w-full h-full"
        />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
          <Image
            src={getImageUrl(shop.avatar, DEFAULT_SHOP_AVATAR)}
            alt={shop.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800">{shop?.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>

        {/* Address + Rating */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}

          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop.rating ?? "0.0"}
          </span>
        </div>

        {/* Category */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {shop.category}
            </span>
          </div>
        )}

        {/* Visit Button */}
        <div className="mt-4">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition"
          >
            Visit Shop
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
