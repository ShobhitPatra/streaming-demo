"use client";

import { useState } from "react";

export default function StreamSse() {
  const [message, setMessage] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const startStream = async () => {
    setIsStreaming(true);
    try {
      const response = await fetch("/api/stream-sse");
      if (!response.body) throw new Error("no response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          console.log("line", line);
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(5);
            console.log("jsonStr", jsonStr);

            try {
              const data = JSON.parse(jsonStr);
              console.log("data", data);

              if (data.type === "text") {
                const content = data.content + " ";
                setMessage((prev) => [...prev, content]);
                setMessage((prev) => [...prev, ""]);
              } else if (data.type === "done") {
                console.log("Streaming finished ...");
              }
            } catch (error) {
              console.error("Error parsing JSON", error);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsStreaming(false);
    }
  };
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Streaming SSE Demo</h1>

      <button
        onClick={startStream}
        disabled={isStreaming}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isStreaming ? "Streaming..." : "Start Stream"}
      </button>

      <div className="mt-6 p-4 border rounded bg-gray-50 min-h-[100px]">
        <p className="whitespace-pre-wrap text-gray-800">
          {message || "Click button to start..."}
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Open DevTools Console to see chunk logging</p>
      </div>
    </div>
  );
}
