// Chat entity class with CRUD operations
export class Chat {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || 'New Chat';
    this.last_message = data.last_message || null;
    this.message_count = data.message_count || 0;
    this.created_date = data.created_date || new Date().toISOString();
    this.updated_date = data.updated_date || new Date().toISOString();
  }

  generateId() {
    return 'chat_' + Math.random().toString(36).substr(2, 9);
  }

  // Static methods for CRUD operations
  static async list(orderBy = '-updated_date') {
    try {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      
      // Sort by updated_date
      if (orderBy === '-updated_date') {
        chats.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
      }
      
      return chats.map(chat => new Chat(chat));
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  static async get(id) {
    try {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const chat = chats.find(c => c.id === id);
      return chat ? new Chat(chat) : null;
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  static async create(data) {
    try {
      const chat = new Chat(data);
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      chats.push(chat);
      localStorage.setItem('chats', JSON.stringify(chats));
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const index = chats.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Chat not found');
      }
      
      chats[index] = { ...chats[index], ...data, updated_date: new Date().toISOString() };
      localStorage.setItem('chats', JSON.stringify(chats));
      return new Chat(chats[index]);
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const filteredChats = chats.filter(c => c.id !== id);
      localStorage.setItem('chats', JSON.stringify(filteredChats));
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const index = chats.findIndex(c => c.id === this.id);
      
      if (index === -1) {
        chats.push(this);
      } else {
        chats[index] = { ...this, updated_date: new Date().toISOString() };
      }
      
      localStorage.setItem('chats', JSON.stringify(chats));
      return this;
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error;
    }
  }

  async delete() {
    return Chat.delete(this.id);
  }
}
