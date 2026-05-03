import { io } from 'socket.io-client';
import { getAccessToken } from './token-store';

class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.currentWorkspace = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    const token = getAccessToken();
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
    const socketUrl = apiUrl.replace(/^http/, 'ws');

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected');
      
      // Re-join current workspace if exists
      if (this.currentWorkspace) {
        this.joinWorkspace(this.currentWorkspace);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('notifications:new', (notification) => {
      this.emit('notifications:new', notification);
    });

    this.socket.on('notification:read', (data) => {
      this.emit('notification:read', data);
    });

    this.socket.on('notifications:all-read', () => {
      this.emit('notifications:all-read');
    });

    this.socket.on('online-users', (data) => {
      this.emit('online-users', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  joinWorkspace(workspaceId) {
    if (!this.socket || !this.connected) return;
    
    this.currentWorkspace = workspaceId;
    this.socket.emit('join-workspace', workspaceId);
  }

  leaveWorkspace(workspaceId) {
    if (!this.socket || !this.connected) return;
    
    this.socket.emit('leave-workspace', workspaceId);
    if (this.currentWorkspace === workspaceId) {
      this.currentWorkspace = null;
    }
  }

  markNotificationRead(notificationId) {
    if (!this.socket || !this.connected) return;
    
    this.socket.emit('mark-notification-read', notificationId);
  }

  markAllNotificationsRead() {
    if (!this.socket || !this.connected) return;
    
    this.socket.emit('mark-all-notifications-read');
  }

  on(event, callback) {
    this.listeners.set(event, callback);
  }

  off(event) {
    this.listeners.delete(event);
  }

  emit(event, data) {
    const callback = this.listeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentWorkspace = null;
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const socketClient = new SocketClient();

export default socketClient;
