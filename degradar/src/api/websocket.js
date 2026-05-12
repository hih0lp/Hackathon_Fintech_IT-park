// WebSocket клиент для FinScope
export class ChatWebSocket {
  constructor(chatId, token) {
    this.chatId = chatId;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // 1 секунда
    this.maxReconnectDelay = 30000; // 30 секунд
    this.pingInterval = null;
    this.messageHandlers = new Map();
    this.isConnecting = false;
    this.isConnected = false;
  }

  // Подключение к WebSocket
  connect() {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const wsUrl = `wss://back.psbsmartedu.ru/ws/chat/${this.chatId}/?token=${this.token}`;
      console.log('5. WebSocket URL:', wsUrl.replace(/token=.+/, 'token=[HIDDEN]'));
      console.log('6. Creating WebSocket...');
      
      this.ws = new WebSocket(wsUrl);
      console.log('7. WebSocket created, readyState:', this.ws.readyState);
      
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  // Настройка обработчиков событий
  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('8. WebSocket OPENED successfully!');
      this.isConnecting = false;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startPing();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('9. WebSocket message received:', data.type);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('10. WebSocket CLOSED:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      this.isConnecting = false;
      this.isConnected = false;
      this.stopPing();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      // Автоматическое переподключение
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('11. WebSocket ERROR:', error);
      this.isConnecting = false;
      this.emit('error', error);
    };
  }

  // Обработка входящих сообщений
  handleMessage(data) {
    const { type } = data;
    
    switch (type) {
      case 'history':
        this.emit('history', data.messages);
        break;
      case 'chat_message':
        this.emit('chat_message', data);
        break;
      case 'processing_started':
        this.emit('processing_started', data);
        break;
      case 'bot_response':
        this.emit('bot_response', data);
        break;
      case 'error':
        this.emit('error', data.message);
        break;
      case 'pong':
        // Обработка pong ответа
        break;
      default:
        console.log('Unhandled WebSocket message type:', type);
    }
  }

  // Отправка сообщения
  sendMessage(text) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const message = {
        type: 'message',
        message: text
      };
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Отправка ping для поддержания соединения
  sendPing() {
    // Дополнительная проверка на существование WebSocket
    if (!this.ws) {
      console.warn('WebSocket is null, cannot send ping');
      return;
    }
    
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        const ping = {
          type: 'ping',
          timestamp: Date.now()
        };
        this.ws.send(JSON.stringify(ping));
      } catch (error) {
        console.error('Error sending ping:', error);
      }
    }
  }

  // Запуск ping интервала
  startPing() {
    // Предотвращаем множественные интервалы
    if (this.pingInterval) {
      console.log('Ping interval already exists, stopping it first');
      this.stopPing();
    }
    
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // Каждые 30 секунд
  }

  // Остановка ping интервала
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Обработка переподключения
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    // Don't reconnect if manually closed
    if (this.ws && this.ws.readyState === WebSocket.CLOSED && this.reconnectAttempts === 0) {
      console.log('WebSocket was closed manually, not reconnecting');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // Подписка на события
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  // Очистка всех обработчиков событий
  clearAllHandlers() {
    this.messageHandlers.clear();
  }

  // Отписка от событий
  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Генерация события
  emit(event, data) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // Закрытие соединения
  close() {
    this.stopPing();
    this.reconnectAttempts = this.maxReconnectAttempts; // Предотвращаем переподключение
    this.clearAllHandlers(); // Очищаем все обработчики событий
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }
    
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  // Получение статуса соединения
  getStatus() {
    if (this.isConnecting) return 'connecting';
    if (this.isConnected) return 'connected';
    if (this.ws) return 'disconnected';
    return 'closed';
  }
}

// Фабрика для создания WebSocket клиента
export function createWebSocketClient(chatId, token) {
  return new ChatWebSocket(chatId, token);
}
