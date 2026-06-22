'use client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table';
import Breadcrumb from 'apps/admin-ui/src/shared/components/Breadcrumbs';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import React, {useState} from 'react'

const columns=[
  {accessorKey: "name", header: "Name"},
  {accessorKey: "email", header: "Email"},
  {accessorKey: "role", header: "Role"},
]

const page = () => {
  const [open, setOpen]=useState(false);
  const [search, setSearch]=useState("");
  const [selectedRole, setSelectedRole]=useState("user");

  const queryClient=useQueryClient();

  const {data, isLoading, isError}=useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res=await axiosInstance.get("/admin/api/get-all-admins");
      return res.data.admins||[];
    },
  });

  const {mutate: updateRole, isPending: updating}=useMutation({
    mutationFn: async () => {
      return await axiosInstance.put("/admin/api/add-new-admin", {
        email: search,
        role: selectedRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["admins"]});
      setOpen(false);
      setSearch("");
      setSelectedRole("user");
    },
    onError: (err) => {
      console.log("Role update failed", err)
    },
  })

  const table=useReactTable({
    data: data||[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSubmit=(e: any) => {
    e.preventDefault();
    updateRole();
  }
  return (
    <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
      <div className='flex justify-between items-center mb-3'>
        <h2 className="text-xl font-bold tracking-wide">Team Management</h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Admin
        </button>
      </div>

      <div className='mb-4'>
        <Breadcrumb title='Team Management'  />
      </div>

      <div className='!rounded shadow-xl border border-slate-700 overflow-hidden'>
        <table className='min-w-full text-left'>
          <thead className='bg-slate-900 text-slate-300'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading? (
              <tr></tr>
            ): (
              <tr></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default page
