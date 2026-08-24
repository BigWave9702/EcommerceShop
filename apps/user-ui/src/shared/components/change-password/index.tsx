import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import {reset} from 'canvas-confetti';
import React, {useState} from 'react'
import { useForm } from "react-hook-form";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (data: any) => {
    setError("")
    setMessage("")
    try {
      const res=await axiosInstance.post("/user/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setMessage(res.data.message);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            className="form-input"
            {...register("currentPassword", {
              required: "Current Password is required",
              minLength: {
                value: 8,
                message: "Must be at least 8 characters",
              },
            })}
          />
          {errors.currentPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.currentPassword?.message)}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="form-input"
            {...register("newPassword", {
              required: "New Password is required",
              minLength: {
                value: 8,
                message: "Must be at least 8 characters",
              },
              validate: {
                hasLower: (value) =>
                  /[a-z]/.test(value)||"Must include a lowercase letter",

                hasUpper: (value) =>
                  /[A-Z]/.test(value)||"Must include an uppercase letter",

                hasNumber: (value) =>
                  /\d/.test(value)||"Must include a number",
              }
            })}
          />
          {errors.newPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.newPassword?.message)}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Re-Enter New password"
            className="form-input"
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              minLength: {
                value: 8,
                message: "Must be at least 8 characters",
              },
              validate: (value) =>
                value === watch("newPassword") || "Password do not match"
            })}
          />
          {errors.confirmPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.confirmPassword?.message)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className='w-full mt-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-300'
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>

      {error && <p className='text-red-500 text-center text-sm'>{error}</p>}
      {message && (
        <p className='text-green-500 text-center text-sm'>{message}</p>
      )}
    </div>
  )
}

export default ChangePassword
