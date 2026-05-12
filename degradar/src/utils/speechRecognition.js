// Speech Recognition utility for voice input
export class SpeechRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.interimTranscript = '';
    this.finalTranscript = '';
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
    
    this.initializeRecognition();
  }

  initializeRecognition() {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'ru-RU'; // Russian language
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.interimTranscript = '';
      if (this.onStart) this.onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.interimTranscript = interimTranscript;
      if (finalTranscript) {
        this.finalTranscript += finalTranscript;
      }

      if (this.onResult) {
        this.onResult({
          interimTranscript: this.interimTranscript,
          finalTranscript: this.finalTranscript,
          isFinal: event.results[event.results.length - 1].isFinal
        });
      }

      // Auto-stop after getting final result with sentence-ending punctuation
      if (finalTranscript && /[.!?]\s*$/.test(finalTranscript.trim())) {
        setTimeout(() => {
          if (this.isListening) {
            this.stop();
          }
        }, 1000);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };

    return true;
  }

  start() {
    if (!this.recognition) {
      if (!this.initializeRecognition()) {
        throw new Error('Speech recognition not supported');
      }
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  reset() {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Voice command processing
  processCommand(transcript) {
    const text = transcript.toLowerCase().trim();
    
    // Basic voice commands
    const commands = {
      // Project management
      'создать проект': { action: 'create_project', params: {} },
      'новый проект': { action: 'create_project', params: {} },
      'открыть проект': { action: 'open_project', params: {} },
      
      // Task management
      'создать задачу': { action: 'create_task', params: {} },
      'новая задача': { action: 'create_task', params: {} },
      'задача': { action: 'create_task', params: {} },
      
      // Chat actions
      'отправить сообщение': { action: 'send_message', params: {} },
      'отправить': { action: 'send_message', params: {} },
      
      // Navigation
      'перейти к проектам': { action: 'navigate_projects', params: {} },
      'проекты': { action: 'navigate_projects', params: {} },
      'главная': { action: 'navigate_home', params: {} },
      
      // Help
      'помощь': { action: 'help', params: {} },
      'что ты умеешь': { action: 'help', params: {} },
      
      // Stop
      'стоп': { action: 'stop', params: {} },
      'остановись': { action: 'stop', params: {} }
    };

    // Check for exact matches first
    for (const [command, action] of Object.entries(commands)) {
      if (text.includes(command)) {
        return action;
      }
    }

    // Extract parameters for specific commands
    if (text.includes('проект') && text.includes('назвать')) {
      const match = text.match(/назвать\s+(.+?)(?:\s|$)/);
      if (match) {
        return {
          action: 'create_project_with_name',
          params: { name: match[1].trim() }
        };
      }
    }

    if (text.includes('задачу') && text.includes('назвать')) {
      const match = text.match(/задачу\s+(.+?)(?:\s|$)/);
      if (match) {
        return {
          action: 'create_task_with_name',
          params: { name: match[1].trim() }
        };
      }
    }

    // Return as chat message if no command found
    return {
      action: 'chat_message',
      params: { message: transcript }
    };
  }

  destroy() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}

// Export singleton instance
export const speechRecognition = new SpeechRecognitionManager();
