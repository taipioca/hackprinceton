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

const DisplayPanel: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex justify-between">
      <div className="text-left">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <h2 className="text-lg text-gray-600">
          {data.type === "person" ? "Your Connection" : "Object Details"}
        </h2>
        <p className="text-gray-500">
          Placeholder description text for {data.name}.
        </p>
      </div>
      {data.type === "person" && (
        <MemoryBubbles memories={data.memories} images={data.images} />
      )}
    </div>
  );
};

export default DisplayPanel;
