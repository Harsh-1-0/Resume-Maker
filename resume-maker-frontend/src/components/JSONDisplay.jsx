import React from "react";

const JSONDisplay = ({ data }) => (
  <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
    {JSON.stringify(data, null, 2)}
  </pre>
);

export default JSONDisplay;
