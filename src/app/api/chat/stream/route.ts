import { NextRequest } from 'next/server';
import { chatStream } from '../../../../lib/services/chatStream';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return new Response(JSON.stringify({ error: 'Missing bookingId' }), { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection ACK
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ bookingId })}\n\n`));

      const onNewMessage = (message: any) => {
        try {
          controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(message)}\n\n`));
        } catch (e) {
          console.error('SSE Error sending message', e);
        }
      };

      const onReadEvent = (readData: any) => {
        try {
          controller.enqueue(encoder.encode(`event: read\ndata: ${JSON.stringify(readData)}\n\n`));
        } catch (e) {
          console.error('SSE Error sending read receipt', e);
        }
      };

      chatStream.on(`message:${bookingId}`, onNewMessage);
      chatStream.on(`read:${bookingId}`, onReadEvent);

      // Keepalive timer every 15s to prevent proxy timeout
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch (e) {
          clearInterval(keepAlive);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        chatStream.off(`message:${bookingId}`, onNewMessage);
        chatStream.off(`read:${bookingId}`, onReadEvent);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
