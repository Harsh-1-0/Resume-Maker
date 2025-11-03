import React from "react";

export default function IconNav({ label, active, onClick }){
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-md ${active ? 'btn-primary text-white shadow-lg' : 'fancy-link text-slate-200'}`}>
      <div className="text-sm font-medium">{label}</div>
    </button>
  );
}
