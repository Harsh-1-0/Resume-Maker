import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {Array.from({length:3}).map((_,i)=>(
        <div key={i} className="glass p-6 animate-pulse">
          <div style={{height:18, width:"60%", background:"rgba(255,255,255,0.03)", borderRadius:6}} />
          <div style={{height:12, width:"40%", background:"rgba(255,255,255,0.02)", borderRadius:6, marginTop:12}} />
          <div style={{height:12, width:"80%", background:"rgba(255,255,255,0.02)", borderRadius:6, marginTop:18}} />
        </div>
      ))}
    </div>
  );
}
