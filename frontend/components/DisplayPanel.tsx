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
    <div className="flex justify-between items-start p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <div className="text-left max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{data.name}</h1>
        <h2 className="text-2xl text-gray-600 mb-6">
          {data.object_type === "person" ? "Your Connection" : "Object Details"}
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          Placeholder description text for {data.name}. This can be a longer
          paragraph describing the person or object in more detail, providing
          context about their significance or your relationship with them. It
          could include information about shared experiences, notable
          characteristics, or any other relevant details that help paint a vivid
          picture of this connection or object.
        </p>
      </div>
      {data.object_type === "person" && (
        <div className="ml-12 flex-shrink-0">
          <MemoryBubbles memories={data.memories} images={data.images} />
        </div>
      )}
    </div>
  );
}
