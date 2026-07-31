"use client";

import React, { useState } from "react";

const tabs = ["Categories", "Logo", "Banner"];

const Customization = () => {
  const [activeTab, setActiveTab] = useState("Categories");

  return (
    <div className="w-full min-h-screen p-8 text-white">
      <h1 className="text-2xl font-semibold mb-4">Customization</h1>
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab ? "bg-blue-600" : "bg-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-md bg-gray-900 p-4">{activeTab}</div>
    </div>
  );
};

export default Customization;
