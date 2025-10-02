export async function GET() {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      sendEvent({
        type: "start",
        content: "",
      });
      await delay(40);

      sendEvent({
        type: "text",
        content: "Hii",
      });
      await delay(40);
      sendEvent({
        type: "text",
        content: "Hello there",
      });
      await delay(40);
      sendEvent({
        type: "text",
        content: "How are you ?",
      });
      await delay(40);

      sendEvent({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
