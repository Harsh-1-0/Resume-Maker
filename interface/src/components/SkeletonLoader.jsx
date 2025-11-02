import React from "react";

export default function SkeletonLoader() {
  // A modern, subtle skeleton with a pulse
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 animate-pulse"
        >
          <div className="h-6 bg-white/5 rounded w-2/3 mb-4" />
          <div className="h-4 bg-white/5 rounded w-1/2 mb-6" />
          <div className="space-y-3">
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded w-4/5" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
