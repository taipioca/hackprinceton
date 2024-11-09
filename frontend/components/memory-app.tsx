'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Circle, X } from "lucide-react"

const memories = [
  { id: 1, title: "Hiking Trip", description: "A beautiful day hiking in the mountains.", videoUrl: "/placeholder.svg" },
  { id: 2, title: "Family Picnic", description: "Wonderful afternoon at the park.", videoUrl: "/placeholder.svg" },
  { id: 3, title: "Beach Day", description: "Relaxing day by the ocean.", videoUrl: "/placeholder.svg" },
  { id: 4, title: "Garden Visit", description: "Spring day at the botanical gardens.", videoUrl: "/placeholder.svg" },
  { id: 5, title: "City Tour", description: "Exploring the vibrant streets of the city.", videoUrl: "/placeholder.svg" },
]

const generateGradient = () => {
  const colors = ['rgba(255,192,203,0.4)', 'rgba(173,216,230,0.4)', 'rgba(255,218,185,0.4)', 'rgba(216,191,216,0.4)']
  const color1 = colors[Math.floor(Math.random() * colors.length)]
  const color2 = colors[Math.floor(Math.random() * colors.length)]
  return `linear-gradient(135deg, ${color1}, ${color2})`
}

export function MemoryApp() {
  const [currentTime, setCurrentTime] = useState('1:07:00')
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date()
      setCurrentTime(date.toLocaleTimeString('en-US', { hour12: false }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        console.log('File uploaded:', file.name)
        // Handle the uploaded file
      }
    }
    input.click()
  }

  const playMemory = (memory) => {
    setSelectedMemory(memory)
    setIsPlaying(true)
    if (videoRef.current) {
      videoRef.current.src = memory.videoUrl
      videoRef.current.play()
    }
  }

  const closeMemory = () => {
    setSelectedMemory(null)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col space-y-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Live Video Section */}
        <div className="relative rounded-lg overflow-hidden border-2 border-white/20">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-red-500 z-10">
            <Circle className="w-3 h-3 fill-current animate-pulse" />
            <span className="text-sm font-medium">REC</span>
          </div>
          <div className="absolute top-4 right-4 text-white/80 font-mono z-10">
            {currentTime}
          </div>
          <video ref={videoRef} className="w-full aspect-video object-cover" autoPlay muted loop>
            <source src="/placeholder.svg" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={handleUpload}
            className="absolute left-4 bottom-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors z-10"
          >
            <ArrowUp className="w-4 h-4" />
            <span>UPLOAD</span>
          </button>

          {/* Memory playback overlay */}
          <AnimatePresence>
            {isPlaying && selectedMemory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20"
              >
                <button
                  onClick={closeMemory}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                  aria-label="Close memory playback"
                >
                  <X className="w-6 h-6" />
                </button>
                <video
                  className="w-full max-w-2xl aspect-video object-cover rounded-lg"
                  controls
                  autoPlay
                >
                  <source src={selectedMemory.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-4 text-white text-center">
                  <h2 className="text-xl font-bold">{selectedMemory.title}</h2>
                  <p className="mt-2">{selectedMemory.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Memories Section */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="relative h-32 rounded-lg overflow-hidden border-2 border-white/20 bg-gray-800/50">
          <div className="absolute inset-0 flex justify-center items-center space-x-4">
            {memories.map((memory, index) => (
              <motion.button
                key={memory.id}
                className="rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm"
                style={{
                  width: '80px',
                  height: '80px',
                  background: generateGradient(),
                }}
                initial={{ y: 0 }}
                animate={{
                  y: ['-10px', '10px', '-10px'],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.2,
                }}
                onClick={() => playMemory(memory)}
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-xs font-medium text-white text-center p-2 select-none">
                  {memory.title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}