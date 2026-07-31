"use client";
import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import React, {useDeferredValue, useMemo, useState} from 'react'
import Image from "next/image";
import Link from "next/link";
import {BarChart, ChevronRight, Eye, Pencil, Plus, Search, Star, Trash} from "lucide-react";
import {flexRender, getCoreRowModel, getFilteredRowModel, useReactTable} from '@tanstack/react-table';

const Page=() => {
  const [globalFilter, setGlobalFilter]=useState("");
  const deferredFilter=useDeferredValue(globalFilter);
  const page=1;
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

  const columns=useMemo(() => [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({row}: any) => (
        <Image
          src={row.original.images[0]?.url}
          alt={row.original.images[0]?.url}
          width={200}
          height={200}
          className="w-12 h-12 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({row}: any) => {
        const truncatedTitle=
          row.original.title.length>25
            ? `${row.original.title.substring(0, 25)}...`
            :row.original.title;
        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="text-blue-400 hover:underline"
            title={row.original.title}
          >
            {truncatedTitle}
          </Link>
        );
      },
    },
    {
      accessorKey: "price",
      header: "price",
      cell: ({row}: any) => <span>${row.original.sale_price}</span>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({row}: any) => (
        <span
          className={row.original.stock<10? "text-red-500":"text-white"}
        >
          ${row.original.sale_price}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({row}: any) => (
        <div className="flex items-center gap-1 text-yellow-400">
          <Star fill="#fde047" size={18} />{" "}
          <span className="text-white">{row.original.ratings||5}</span>
        </div>
      ),
    },
    {
      header: "Action",
      cell: ({row}: any) => (
        <div className="flex gap-3">
          <Link
            href={`/product/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
          <Link
            href={`/product/edit/${row.original.id}`}
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            <Pencil size={18} />
          </Link>
          <button className="text-green-400 hover:text-green-300 transition">
            <BarChart size={18} />
          </button>
          <button className="text-red-400 hover:text-red-300 transition" onClick={() => {}}>
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {globalFilter},
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus /> Add Product
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Products</span>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading? (
          <p className="text-center text-white">Loading Products...</p>
        ):(
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder? null:flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:border-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Page
