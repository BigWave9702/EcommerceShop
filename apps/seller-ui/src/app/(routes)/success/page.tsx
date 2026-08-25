"use client";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center text-white p-8 text-center">
      <CheckCircle size={64} className="text-green-500 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">You&apos;re all set!</h1>
      <p className="text-gray-400 mb-6 max-w-md">
        Your Stripe account is connected and your shop is ready to start
        selling.
      </p>
      <Link
        href="/dashboard"
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Page;
