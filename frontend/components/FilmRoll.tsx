'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/button'

interface Props {
  data: {
    type: string;
    name: string;
    memories: string[];
    images: string[];
  };
}

export default function FilmRoll({ data }: Props) {
  const [isUnrolled, setIsUnrolled] = useState(false)

  const toggleRoll = () => {
    setIsUnrolled(!isUnrolled)
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-gray-200 rounded-lg p-4 shadow-lg">
        <div className="relative">
          <div className={`transition-all duration-500 ease-in-out ${isUnrolled ? 'h-auto' : 'h-64 overflow-hidden'}`}>
            <div className="flex flex-col gap-2">
              {data.images.map((image, index) => (
                <div key={index} className="relative h-60 bg-black rounded-md overflow-hidden">
                  <Image
                    src={image}
                    alt={`${data.name} - Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white text-sm">
                    Frame {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2 bg-white"
            onClick={toggleRoll}
            aria-expanded={isUnrolled}
            aria-label={isUnrolled ? "Roll up film" : "Unroll film"}
          >
            {isUnrolled ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold mb-2">{data.name}</h2>
        <div className="text-sm text-gray-600">
          {data.memories.map((memory, index) => (
            <p key={index} className="mb-1">{memory}</p>
          ))}
        </div>
      </div>
    </div>
  )
}