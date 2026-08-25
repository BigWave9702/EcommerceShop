"use client";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "apps/seller-ui/src/shared/components/Breadcrumbs";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { Pencil, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const { id } = useParams() as { id: string };

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["shop-product", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/get-shop-product/${id}`);
      return res?.data?.product;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return <p className="p-8 text-white">Loading product...</p>;
  }

  if (isError || !product) {
    return <p className="p-8 text-red-500">Failed to load product.</p>;
  }

  const isEvent = Boolean(product.starting_date && product.ending_date);

  return (
    <div className="w-full min-h-screen p-8 text-white">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-semibold">{product.title}</h2>
        <Link
          href={`/product/edit/${product.id}`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          <Pencil size={16} /> Edit Product
        </Link>
      </div>
      <Breadcrumb title={product.title} />

      <div className="flex gap-6 mt-4">
        <div className="w-[35%]">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
            {product.images?.[0]?.url && (
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {product.images?.slice(1).map((img: any) => (
              <div
                key={img.id}
                className="relative h-[70px] rounded-md overflow-hidden bg-gray-900 border border-gray-700"
              >
                <Image src={img.url} alt={product.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-[65%] bg-gray-900 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Category</p>
              <p>{product.category} / {product.subCategory}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Brand</p>
              <p>{product.brand || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Regular Price</p>
              <p>${product.regular_price}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sale Price</p>
              <p className="text-green-400 font-medium">${product.sale_price}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Stock</p>
              <p className={product.stock < 10 ? "text-red-500" : ""}>
                {product.stock}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Sales</p>
              <p>{product.totalSales ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rating</p>
              <p className="flex items-center gap-1">
                <Star fill="#fde047" size={16} /> {product.ratings ?? 5}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p>{product.status}</p>
            </div>
            {isEvent && (
              <>
                <div>
                  <p className="text-gray-400 text-sm">Event Starts</p>
                  <p>{new Date(product.starting_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Event Ends</p>
                  <p>{new Date(product.ending_date).toLocaleDateString()}</p>
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-1">Short Description</p>
            <p>{product.short_description}</p>
          </div>

          {product.tags?.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Tags</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: product.detailed_description }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
