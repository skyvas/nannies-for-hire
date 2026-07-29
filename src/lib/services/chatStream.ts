import { EventEmitter } from 'events';

class ChatStreamService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

  public broadcastMessage(bookingId: string, message: any) {
    this.emit(`message:${bookingId}`, message);
    this.emit(`unread:${message.receiverId || 'all'}`, message);
  }

  public broadcastRead(bookingId: string, readData: any) {
    this.emit(`read:${bookingId}`, readData);
  }
}

const globalForChat = globalThis as unknown as {
  chatStream: ChatStreamService | undefined;
};

export const chatStream = globalForChat.chatStream ?? new ChatStreamService();

if (process.env.NODE_ENV !== 'production') {
  globalForChat.chatStream = chatStream;
}
