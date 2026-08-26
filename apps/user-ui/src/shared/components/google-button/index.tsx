"use client";
import * as React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const GoogleButton = () => {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-google`,
        { idToken: credentialResponse.credential },
        { withCredentials: true }
      );
      router.push("/");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Google sign-in failed. Please try again."
      );
    }
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleButton;
