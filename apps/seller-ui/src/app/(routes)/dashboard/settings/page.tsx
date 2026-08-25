"use client";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { ChevronRight } from "lucide-react";
import Input from "packages/components/input";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Page = () => {
  const { seller, isLoading, refetch } = useSeller();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (seller?.shop) {
      reset({
        name: seller.shop.name,
        bio: seller.shop.bio,
        category: seller.shop.category,
        address: seller.shop.address,
        opening_hours: seller.shop.opening_hours,
        website: seller.shop.website,
      });
    }
  }, [seller, reset]);

  const onSubmit = async (data: any) => {
    try {
      await axiosInstance.put("/seller/api/update-shop", data);
      toast.success("Shop settings updated successfully!");
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update shop settings"
      );
    }
  };

  if (isLoading) {
    return <p className="p-8 text-white">Loading settings...</p>;
  }

  return (
    <div className="w-full mx-auto p-8 shadow-md rounded-lg text-white">
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Shop Settings
      </h2>
      <div className="flex items-center mb-4">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Settings</span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl bg-gray-900 p-6 rounded-lg space-y-4"
      >
        <div>
          <Input
            label="Shop Name *"
            placeholder="My Shop"
            {...register("name", { required: "Shop name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.name.message as string}
            </p>
          )}
        </div>

        <div>
          <Input
            type="textarea"
            rows={4}
            label="Bio"
            placeholder="Tell buyers about your shop"
            {...register("bio")}
          />
        </div>

        <div>
          <Input
            label="Category *"
            placeholder="Electronics"
            {...register("category", { required: "Category is required" })}
          />
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">
              {errors.category.message as string}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Address *"
            placeholder="123 Main St"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message as string}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Opening Hours"
            placeholder="Mon-Fri 9am-6pm"
            {...register("opening_hours")}
          />
        </div>

        <div>
          <Input
            label="Website"
            placeholder="https://example.com"
            {...register("website")}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-700 text-white rounded-md"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
