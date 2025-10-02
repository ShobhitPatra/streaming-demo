"use client";

import { useState } from "react";

export default function StreamDemo() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async () => {
    setIsStreaming(true);
    setText("");

    try {
      const response = await fetch("/api/stream-text");

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Stream complete!");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("Received chunk:", chunk);

        // Append to text
        setText((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Streaming Demo</h1>

      <button
        onClick={startStream}
        disabled={isStreaming}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isStreaming ? "Streaming..." : "Start Stream"}
      </button>

      <div className="mt-6 p-4 border rounded bg-gray-50 min-h-[100px]">
        <p className="whitespace-pre-wrap text-gray-800">
          {text || "Click button to start..."}
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Open DevTools Console to see chunk logging</p>
      </div>
    </div>
  );
}
