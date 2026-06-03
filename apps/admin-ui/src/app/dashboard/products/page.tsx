"use client";
import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import React, {useDeferredValue, useMemo, useState} from 'react'

const Page=() => {
  const [globalFilter, setGlobalFilter]=useState("");
  const deferredFilter=useDeferredValue(globalFilter);
  const [page, setPage]=useState(1);
  const limit=10;

  const { data, isLoading }: UseQueryResult<any> = useQuery({
    queryKey: ["all-products", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const allProducts=data?.data||[];
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: any) =>
      Object.values(product)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [allProducts, deferredFilter]);

  const totalPages = Math.ceil((data?.meta.totalProducts ?? 0) / limit);

  const columns=useMemo(
    () => [
      {
        accessorKey: "images",
        header: "Image",
        cell: ({row}: any) => (
          <img
            src={row.original.images[0]?.url}
            alt={row.original.name}
            className="w-12 h-12 object-cover rounded"
          />
        ),
       },
       {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: any) => (
          <span className="text-white">{row.original.name}</span>
        ),
       },
       {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => (
          <span className="text-white">${row.original.price.toFixed(2)}</span>
        ),
       },
       {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span className="text-white">{row.original.stock}</span>
        ),
       },
       {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }: any) => (
          <span className="text-white">
            {row.original?.category?.name ?? "Uncategorized"}
          </span>
        ),
       },
       {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-white">
            {row.original?.shop?.name ?? "Unknown Shop"}
          </span>
         ),
      },
      {

       }
    ]
  )

  return (
    <div>Page</div>
  )
}

export default Page
