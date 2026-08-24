"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { countries } from "apps/user-ui/src/configs/countries";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "Vietnam",
      isDefault: false,
    },
  });
  const [showDeleteModal, setShowDeleteModal]=useState(false);
  const [selectedAddressId, setSelectedAddressId]=useState<string|null>(null);
  const { mutate: addAddress } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post("/user/api/add-address", payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      reset();
      setShowModal(false);
    },
  });

  //Get addresses
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/api/shipping-addresses");
      return res.data.address;
    },
  });

  const onSubmit = (data: any) => {
    addAddress({
      ...data,
      isDefault: data.isDefault,
    });
  };

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/user/api/delete-address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
  });
  console.log('address: ', addresses);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      <div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading Address ...</p>
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-sm text-gray-600">No saved addresses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...addresses]
              .sort((a, b) => Number(b.isDefault)-Number(a.isDefault))
              .map((address: any) => (
              <div
                key={address.id}
                className="border border-gray-200 rounded-md p-4 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {address.label} - {address.name}
                    </p>
                    <p>
                      {address.street}, {address.city}, {address.zip},{" "}
                      {address.country}
                    </p>
                  </div>
                </div>
                {!address.isDefault && (<div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center gap-1 !cursor-pointer text-xs text-red-500"
                    onClick={() => {
                      setSelectedAddressId(address.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md p-6 rounded-2xl relative"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Address
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="flex gap-2">
                <input
                  placeholder="Name"
                  {...register("name", { required: "Name is required" })}
                  className="form-input w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}

                <select
                  {...register("country")}
                  defaultValue=""
                  className="form-input w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                >
                  <option value="" disabled>
                    Select country
                  </option>

                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <input
                placeholder="Street"
                {...register("street", { required: "Street is required" })}
                className="form-input w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
              />
              {errors.street && (
                <p className="text-red-500 text-xs">{errors.street.message}</p>
              )}

              <div className="flex gap-2">
                <input
                  placeholder="City"
                  {...register("city", { required: "City is required" })}
                  className="form-input w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs">{errors.city.message}</p>
                )}

                <input
                  placeholder="Zip"
                  {...register("zip", { required: "Zip code is required" })}
                  className="form-input w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                />
              </div>

              <input type="hidden" {...register("label")} />
              <div className="flex items-center gap-3">
                {["Home", "Work", "Other"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("label", type)}
                    className={`px-4 py-2 rounded-lg border transition-all ${type===watch("label")
                        ? "bg-blue-600 text-white border-blue-600"
                        :"bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Set as Default</span>

                <button
                  type="button"
                  onClick={() =>
                    setValue("isDefault", !watch("isDefault"))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${watch("isDefault")? "bg-blue-600":"bg-gray-300"
                    }`}
                >
                  <span
                    className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${watch("isDefault") ? "translate-x-5" : ""
                      }`}
                  />
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirm Modal */}
      {showDeleteModal&&(
        <div
          onClick={() => setShowDeleteModal(false)}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Delete Address
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this address?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if(selectedAddressId) {
                    deleteAddress(selectedAddressId);
                  }

                  setShowDeleteModal(false);
                  setSelectedAddressId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
