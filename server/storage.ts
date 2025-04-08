import { 
  users, 
  messages, 
  replies, 
  type User, 
  type InsertUser, 
  type Message,
  type InsertMessage,
  type Reply,
  type InsertReply
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUsers(ids: number[]): Promise<void>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  getAllMessages(): Promise<Message[]>;
  
  // Reply operations
  createReply(reply: InsertReply): Promise<Reply>;
  getUserReplies(userId: number): Promise<Reply[]>;
  getRepliesByUserAndMessage(userId: number, messageId: number): Promise<Reply[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private replies: Map<number, Reply>;
  userCurrentId: number;
  messageCurrentId: number;
  replyCurrentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.replies = new Map();
    this.userCurrentId = 1;
    this.messageCurrentId = 1;
    this.replyCurrentId = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    
    // Add some sample data
    this.seedData();
  }
  
  private seedData() {
    // Sample users with hashed passwords (these are pre-computed for simplicity)
    // In a real app, we would use async hashing
    const user1: User = {
      id: this.userCurrentId++,
      username: "john_doe",
      password: "5a4d5f4d92f04e4759af96e49c4fd42175a60c91cbc2f437f4b53c281bc64362c82b99d1df7ae58cd8bdcc5e9b1843ea44007fda247b94fea11c9b26e9c5c01b.d8b41c50c7215de9c7ed699f36716ce7", // password123
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      joinedDate: new Date("2023-03-10"),
    };
    
    const user2: User = {
      id: this.userCurrentId++,
      username: "jane_smith",
      password: "5a4d5f4d92f04e4759af96e49c4fd42175a60c91cbc2f437f4b53c281bc64362c82b99d1df7ae58cd8bdcc5e9b1843ea44007fda247b94fea11c9b26e9c5c01b.d8b41c50c7215de9c7ed699f36716ce7", // password123
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543",
      joinedDate: new Date("2023-04-15"),
    };
    
    const user3: User = {
      id: this.userCurrentId++,
      username: "robert_johnson",
      password: "5a4d5f4d92f04e4759af96e49c4fd42175a60c91cbc2f437f4b53c281bc64362c82b99d1df7ae58cd8bdcc5e9b1843ea44007fda247b94fea11c9b26e9c5c01b.d8b41c50c7215de9c7ed699f36716ce7", // password123
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "+1 (555) 456-7890",
      joinedDate: new Date("2023-05-01"),
    };
    
    // Admin user for easy login
    const adminUser: User = {
      id: this.userCurrentId++,
      username: "admin",
      password: "9c51ef4ac9be0d9bc60e47938d6d258dbcbd09d0208a61c0befcd43a123f45b9bd6387e1b5939ae7e8425d7c29b1c307a16cbc9dd714e1cbc16fcce946d42d36.91eefb9fa92e09ac9f58eba0ac257a95", // password
      name: "Admin User",
      email: "admin@example.com",
      phone: "+1 (555) 999-0000",
      joinedDate: new Date(),
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    this.users.set(adminUser.id, adminUser);
    
    // Sample messages
    const message1: Message = {
      id: this.messageCurrentId++,
      content: "Hello! Welcome to our service. How can we assist you today?",
      fixedReplyRequired: true,
      fixedReply: "Thank you for reaching out. Our team will assist you shortly.",
      createdAt: new Date("2023-05-15"),
    };
    
    const message2: Message = {
      id: this.messageCurrentId++,
      content: "Thank you for your interest in our premium service package!",
      fixedReplyRequired: false,
      fixedReply: null,
      createdAt: new Date("2023-05-20"),
    };
    
    const message3: Message = {
      id: this.messageCurrentId++,
      content: "Your appointment has been confirmed for tomorrow at 2:00 PM.",
      fixedReplyRequired: true,
      fixedReply: "I confirm I will attend the appointment at the scheduled time.",
      createdAt: new Date("2023-05-22"),
    };
    
    this.messages.set(message1.id, message1);
    this.messages.set(message2.id, message2);
    this.messages.set(message3.id, message3);
    
    // Sample replies
    const reply1: Reply = {
      id: this.replyCurrentId++,
      userId: user1.id,
      messageId: message1.id,
      content: "I'd like to get more information about your services, please.",
      replyDate: new Date("2023-05-15T14:30:00"),
    };
    
    const reply2: Reply = {
      id: this.replyCurrentId++,
      userId: user1.id,
      messageId: message3.id,
      content: "Thank you for confirming my appointment. I'll be there on time.",
      replyDate: new Date("2023-05-22T10:15:00"),
    };
    
    this.replies.set(reply1.id, reply1);
    this.replies.set(reply2.id, reply2);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      joinedDate: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async deleteUsers(ids: number[]): Promise<void> {
    for (const id of ids) {
      this.users.delete(id);
      
      // Delete related replies
      for (const [replyId, reply] of this.replies.entries()) {
        if (reply.userId === id) {
          this.replies.delete(replyId);
        }
      }
    }
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
  
  async updateMessage(id: number, messageData: Partial<InsertMessage>): Promise<Message> {
    const existingMessage = await this.getMessage(id);
    
    if (!existingMessage) {
      throw new Error(`Message with id ${id} not found`);
    }
    
    const updatedMessage: Message = {
      ...existingMessage,
      ...messageData,
    };
    
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteMessage(id: number): Promise<void> {
    this.messages.delete(id);
    
    // Delete related replies
    for (const [replyId, reply] of this.replies.entries()) {
      if (reply.messageId === id) {
        this.replies.delete(replyId);
      }
    }
  }
  
  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }
  
  // Reply methods
  async createReply(insertReply: InsertReply): Promise<Reply> {
    const id = this.replyCurrentId++;
    const reply: Reply = {
      ...insertReply,
      id,
      replyDate: new Date(),
    };
    this.replies.set(id, reply);
    return reply;
  }
  
  async getUserReplies(userId: number): Promise<Reply[]> {
    return Array.from(this.replies.values()).filter(
      (reply) => reply.userId === userId
    );
  }
  
  async getRepliesByUserAndMessage(userId: number, messageId: number): Promise<Reply[]> {
    return Array.from(this.replies.values()).filter(
      (reply) => reply.userId === userId && reply.messageId === messageId
    );
  }
}

export const storage = new MemStorage();
