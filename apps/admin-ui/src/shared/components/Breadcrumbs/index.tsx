"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  title: string;
  href?: string;
  parentLabel?: string;
}

const Breadcrumb = ({
  title,
  href = "/dashboard",
  parentLabel = "Dashboard",
}: BreadcrumbProps) => {
  return (
    <div className="w-full text-white flex items-center">
      <Link href={href} className="text-blue-400 cursor-pointer">
        {parentLabel}
      </Link>

      <ChevronRight size={20} className="opacity-[.8]" />

      <span>{title}</span>
    </div>
  );
};

export default Breadcrumb;
