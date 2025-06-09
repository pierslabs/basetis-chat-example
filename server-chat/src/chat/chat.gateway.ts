// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  name: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Store users by socket ID for better management
  private connectedUsers: Map<string, User> = new Map();

  // Store socket IDs by username for easy lookup
  private userSockets: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.userSockets.delete(user.name);
      this.connectedUsers.delete(client.id);
    }
    this.emitUserList();
  }

  @SubscribeMessage('set-username')
  handleSetUsername(
    @MessageBody() name: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!name || typeof name !== 'string') {
      client.emit('error', { message: 'Invalid username' });
      return;
    }

    // Remove old user if exists
    const existingSocketId = this.userSockets.get(name);
    if (existingSocketId) {
      this.connectedUsers.delete(existingSocketId);
    }

    // Add new user
    const user: User = { id: client.id, name };
    this.connectedUsers.set(client.id, user);
    this.userSockets.set(name, client.id);

    this.emitUserList();
  }

  @SubscribeMessage('get-users')
  handleGetUsers(@ConnectedSocket() client: Socket) {
    client.emit('user-list', this.getUserList());
  }

  private getUserList(): User[] {
    return Array.from(this.connectedUsers.values());
  }

  private emitUserList() {
    const users = this.getUserList();
    this.server.emit('user-list', users);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { sender: string; recipient: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.message || !data.recipient) {
      return;
    }

    const senderUser = this.connectedUsers.get(client.id);
    if (!senderUser) {
      return;
    }

    // Find the recipient user by their ID
    const recipientId = data.recipient;
    const recipientUser = Array.from(this.connectedUsers.values()).find(
      (user) => user.id === recipientId,
    );

    if (recipientUser) {
      // The recipientId is already the socket ID, so use it directly

      // Send to recipient
      this.server.to(recipientId).emit('message', {
        author: senderUser.name,
        text: data.message,
      });

      // Send confirmation to sender
      client.emit('message', {
        author: 'me',
        text: data.message,
      });
    }
  }
}
