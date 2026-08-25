"use client";
import { useQuery } from "@tanstack/react-query";
import ProductForm from "apps/seller-ui/src/shared/modules/product/product-form";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
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

  return <ProductForm mode="edit" productId={id} initialData={product} />;
};

export default Page;
