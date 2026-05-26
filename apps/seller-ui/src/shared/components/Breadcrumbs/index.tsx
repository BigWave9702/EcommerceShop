"use client";
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
    <div className="flex items-center mb-4">
      <Link href={href} className="text-blue-400 cursor-pointer">
        {parentLabel}
      </Link>

      <ChevronRight size={20} className="text-gray-200" />

      <span className="text-white">{title}</span>
    </div>
  );
};

export default Breadcrumb;
