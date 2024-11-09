"use client";

import React from "react";
import MemoryBubbles from "./MemoryBubbles";

interface Props {
  data: {
    type: string;
    name: string;
    memories: string[];
    images: string[];
  };
}

export default function DisplayPanel({ data }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          {data.name}
        </h1>
        <p className="text-2xl font-light text-gray-600">
          {data.object_type === "person" ? "Your Connection" : "Object Details"}
        </p>
      </div>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed text-lg">
            Placeholder description text for {data.name}. This can be a longer
            paragraph describing the person or object in more detail, providing
            context about their significance or your relationship with them. It
            could include information about shared experiences, notable
            characteristics, or any other relevant details that help paint a
            vivid picture of this connection or object.
          </p>
        </div>
        {data.object_type === "person" && (
          <MemoryBubbles images={data.images} />
        )}
      </div>
    </div>
  );
}
