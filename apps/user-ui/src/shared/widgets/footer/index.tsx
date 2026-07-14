"use client";
import React from 'react';
import {usePathname} from 'next/navigation';

const Footer=() => {
  const pathname = usePathname();

  if (pathname === "/inbox") return null

  return (
    <div className='bg-[#f4f7f9] border-t border-t-slate-200 py-10 text-gray-200'>
      <div className='w-[90%] lg:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
        {/* About Company */}
      </div>
    </div>
  )
}

export default Footer
