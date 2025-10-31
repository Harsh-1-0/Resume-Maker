import React from "react";

const Button = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
    {...props}
  >
    {children}
  </button>
);

export default Button;
