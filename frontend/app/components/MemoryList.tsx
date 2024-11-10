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
import { Circle, Home, LoaderPinwheel, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);

  const handleFetchMemory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/dump_memory?type=${filter}`
      );
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      setData(null);
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100  to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      <div className="container mx-auto p-4 space-y-8 relative z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            memo<span className="text-blue-300 mr-10">re</span>
          </h1>
          <div className="flex space-x-4">
            <Link href="/">
              <Button className="text-sm tracking-tighter" variant="outline">
                <Home className="mr-2" /> home
              </Button>
            </Link>
            <Link href="/metaquest">
              <Button className="text-sm tracking-tighter" variant="outline">
                <Circle fill="red" stroke="none" className="mr-2" />
                in a convo? record a new memory
              </Button>
            </Link>
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
            <TabsTrigger value="all">my memories</TabsTrigger>
            <TabsTrigger value="person">people</TabsTrigger>
            <TabsTrigger value="object">objects</TabsTrigger>
          </TabsList>
          {loading && (
            <div className="w-full flex flex-col items-center justify-center text-sm p-20 font-semibold gap-2">
              {" "}
              Hang tight!
              <LoaderPinwheel className="animate-spin " />
            </div>
          )}
          {!loading && (
            <>
              <TabsContent value="all" className="mt-6">
                <MemoryGrid items={filteredData} />
              </TabsContent>
              <TabsContent value="person" className="mt-6">
                <MemoryGrid items={filteredData} />
              </TabsContent>
              <TabsContent value="object" className="mt-6">
                <MemoryGrid items={filteredData} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          33% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          66% {
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

function MemoryGrid({ items }: { items: MemoryItem[] }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <Card
          key={index}
          className="overflow-hidden bg-white/80 backdrop-blur-sm"
        >
          <CardHeader className="pb-1 pl-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <Badge
                variant={
                  item.object_type === "person" ? "default" : "secondary"
                }
                className={
                  item.object_type === "person" ? "bg-green-500" : "bg-red-200"
                }
              >
                {item.object_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-40 p-4 overflow-x-auto">
              <div className="flex gap-2">
                {item.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-md cursor-pointer"
                    onClick={() => setExpandedImage(img)}
                  >
                    <Image
                      src={`data:image/png;base64,${img}`}
                      alt={`Image ${idx + 1} of ${item.name}`}
                      className="object-cover"
                      height={120}
                      width={120}
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
      {expandedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-4">
            <Image
              src={`data:image/png;base64,${expandedImage}`}
              alt="Expanded memory"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              height={600}
              width={500}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
