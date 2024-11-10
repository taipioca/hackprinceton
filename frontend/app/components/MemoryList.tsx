"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import UploadModal from "./UploadModal";
import UpdateModal from "./UpdateModal";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Circle, CircleAlert, Home } from "lucide-react";

export interface MemoryItem {
  type: "person" | "object";
  name: string;
  memories: string[];
  images: string[];
  object_type: string;
}

export default function MemoryList() {
  const [data, setData] = useState<MemoryItem[] | null>(null);
  const [filter, setFilter] = useState<"all" | "person" | "object">("all");

  const handleFetchMemory = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/dump_memory?type=${filter}`
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching data", err);
      setData(null);
    }
  };

  useEffect(() => {
    handleFetchMemory();
  }, [filter]);

  const filteredData = data
    ? data.filter((item) =>
        filter === "all" ? true : item.object_type === filter
      )
    : [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">my memories!</h1>

        <div className="flex space-x-4">
          <Button className="text-sm tracking-tighter" variant="outline">
            <Home /> home
          </Button>
          <Button className="text-sm tracking-tighter" variant="outline">
            <Circle fill="red" stroke="none" />
            in a convo? record a new memory
          </Button>
          <UpdateModal />
          <UploadModal />
        </div>
      </div>

      <Tabs
        defaultValue="all"
        onValueChange={(value) =>
          setFilter(value as "all" | "person" | "object")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">all memories</TabsTrigger>
          <TabsTrigger value="person">people</TabsTrigger>
          <TabsTrigger value="object">objects</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <MemoryGrid items={filteredData} />
        </TabsContent>
        <TabsContent value="person" className="mt-6">
          <MemoryGrid items={filteredData} />
        </TabsContent>
        <TabsContent value="object" className="mt-6">
          <MemoryGrid items={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MemoryGrid({ items }: { items: MemoryItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <Badge
                variant={
                  item.object_type === "person" ? "default" : "secondary"
                }
                className="bg-green-500"
              >
                {item.object_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <h3 className="mb-2 p-4">My Memories</h3>
            <ScrollArea className="h-40 p-4 overflow-x-auto">
              <div className="flex gap-2">
                {item.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-md"
                  >
                    <img
                      src={`data:image/png;base64,${img}`}
                      alt={`Image ${idx + 1} of ${item.name}`}
                      className="object-cover w-32 h-32"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4">
              <ScrollArea className="h-32">
                <ul className="list-disc pl-5 space-y-1">
                  {item.memories.map((memory, idx) => (
                    <li key={idx} className="text-sm">
                      {memory}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
