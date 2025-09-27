// Message entity class with CRUD operations
export class Message {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.chat_id = data.chat_id;
    this.content = data.content || '';
    this.role = data.role || 'user'; // 'user' or 'assistant'
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  generateId() {
    return 'msg_' + Math.random().toString(36).substr(2, 9);
  }

  // Static methods for CRUD operations
  static async list(chatId = null) {
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      
      let filteredMessages = messages;
      if (chatId) {
        filteredMessages = messages.filter(m => m.chat_id === chatId);
      }
      
      // Sort by timestamp
      filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      return filteredMessages.map(message => new Message(message));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  static async get(id) {
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      const message = messages.find(m => m.id === id);
      return message ? new Message(message) : null;
    } catch (error) {
      console.error('Error getting message:', error);
      return null;
    }
  }

  static async create(data) {
    try {
      const message = new Message(data);
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      messages.push(message);
      localStorage.setItem('messages', JSON.stringify(messages));
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      const index = messages.findIndex(m => m.id === id);
      
      if (index === -1) {
        throw new Error('Message not found');
      }
      
      messages[index] = { ...messages[index], ...data };
      localStorage.setItem('messages', JSON.stringify(messages));
      return new Message(messages[index]);
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      const filteredMessages = messages.filter(m => m.id !== id);
      localStorage.setItem('messages', JSON.stringify(filteredMessages));
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async filter(criteria) {
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      
      return messages.filter(message => {
        return Object.keys(criteria).every(key => {
          return message[key] === criteria[key];
        });
      }).map(message => new Message(message));
    } catch (error) {
      console.error('Error filtering messages:', error);
      return [];
    }
  }

  // Instance methods
  async save() {
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      const index = messages.findIndex(m => m.id === this.id);
      
      if (index === -1) {
        messages.push(this);
      } else {
        messages[index] = this;
      }
      
      localStorage.setItem('messages', JSON.stringify(messages));
      return this;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async delete() {
    return Message.delete(this.id);
  }
}
