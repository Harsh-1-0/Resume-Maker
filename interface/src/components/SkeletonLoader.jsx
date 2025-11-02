import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse"
        >
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-5"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
