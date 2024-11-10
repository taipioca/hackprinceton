"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Cloud, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import Image from "next/image";
import axios from "axios";

export default function DetectMemoryPage() {
  const [memoryData, setMemoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get("http://127.0.0.1:5000/get_image_memory")
        .then((response: any) => {
          if (response.data.status === "detecting") {
            setMemoryData(null);
          } else {
            setMemoryData(response.data);

            // If audio data exists, decode and play it
            if (response.data.mp3) {
              const audioData = `data:audio/mp3;base64,${response.data.mp3}`;
              const newAudio = new Audio(audioData);
              newAudio.play();
            }
          }
          setLoading(false);
        })
        .catch((error: any) => {
          console.error("Error fetching data", error);
          setLoading(false);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
      <div className="flex justify-center items-center p-4 gap-2 w-max z-50">
        <h1 className="text-3xl font-bold tracking-tighter">
          memo<span className="text-blue-300 mr-10">re</span>
        </h1>

        <div className="flex-1 space-x-4">
          <Link href="/">
            <Button className="text-sm tracking-tighter" variant="outline">
              <Home /> home
            </Button>
          </Link>
          <Link href="/database">
            <Button className="text-sm tracking-tighter" variant="outline">
              <Cloud />
              view {memoryData?.name ? memoryData.name + " in" : ""} memories
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="jumbo absolute -inset-[10px] opacity-50"></div>
      </div>
      <Card className="w-full max-w-2xl mx-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Memory Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Detecting memories...
              </p>
            </div>
          ) : memoryData === null ? (
            <div className="text-center space-y-2">
              <div className="text-6xl">🤖</div>
              <p className="text-xl font-medium text-gray-600 dark:text-gray-300">
                Nothing detected yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-3xl tracking-tighter font-bold text-center">
                {memoryData.name}
              </h2>
              <p className="text-lg text-center text-gray-600 dark:text-gray-300">
                {memoryData.object_type}
              </p>
              <div>
                <h3 className="text-xl font-semibold mb-2">Memories:</h3>
                <ScrollArea className="h-40 rounded-md border p-4">
                  <ul className="list-disc pl-4 space-y-2">
                    {memoryData.memories.map((memory: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        {memory}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Photos:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {memoryData.images.map((img: string, idx: number) => (
                    <Image
                      key={idx}
                      src={`data:image/png;base64,${img}`}
                      alt={`Image ${idx}`}
                      height={32}
                      width={32}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
