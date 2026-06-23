"use client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import React, { useDeferredValue, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import { Download, Search } from "lucide-react";
import Breadcrumb from "apps/admin-ui/src/shared/components/Breadcrumbs";
import Image from "next/image";

type Seller = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  shop: {
    name: string;
    avatar: string;
    address: string;
  };
};

type SellersResponse = {
  data: Seller[];
  meta: {
    totalSellers: number;
    currentPage: number;
    totalPages: number;
  };
};

const SellersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 10;

  const { data, isLoading }: UseQueryResult<SellersResponse | Error> = useQuery<
    SellersResponse,
    Error,
    SellersResponse,
    [string, number]
  >({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`,
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const allSellers = data?.data || [];
  const filteredUsers = useMemo(() => {
    return allSellers.filter((seller) =>
      deferredGlobalFilter
        ? Object.values(seller)
            .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true,
    );
  }, [allSellers, deferredGlobalFilter]);

  const totalPages = Math.ceil((data?.meta?.totalSellers ?? 0) / limit);
  const columns = useMemo(
    () => [
      {
        accessorKey: "shop.avatar",
        header: "Avatar",
        cell: ({ row }: any) => (
          <Image
            src={
              row.original.images[0]?.url ||
              "https://ik.imagekit.io/bigwavehaibuithe/default-image.jpg?updatedAt=1757054034113"
            }
            alt={row.original.title}
            width={40}
            height={40}
            className="w-10 h-10 rounded object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "shop.name",
        header: "Shop Name",
        cell: ({ row }: any) => {
          const shopName = row.original.shop?.name;
          return shopName ? (
            <a
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${row.original.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {shopName}
            </a>
          ) : (
            <span className="text-gray-400 italic">No Shop</span>
          );
        },
      },
      {
        accessorKey: "shop.address",
        header: "Shop Address",
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredUsers.map(
      (user) => `${user.name},${user.email},${user.role},${user.createdAt}`,
    );
    const blob = new Blob(
      [`Name,Email,Role,Created At\n${csvData.join("\n")}`],
      { type: "text/csv:charset=utf-8" },
    );
    saveAs(blob, `users-page-${Date.now()}.csv`);
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold tracking-wide">All Sellers</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white transition rounded"
          >
            <Download size={16} />
            Export to CSV
          </button>
          <select
            className="bg-gray-800 border border-gray-700 outline-none text-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            All Roles
            <option value={"admin"}>ADMIN</option>
            <option value={"user"}>USER</option>
          </select>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb title="All Users" />
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading Events...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
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
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellersPage;
