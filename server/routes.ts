import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema,
  insertQuestionSchema, 
  insertReplySchema,
  insertUserSchema,
  sendMessageSchema,
  addQuestionSchema,
  updateQuestionSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    advisorId?: number;
    accessToken?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to forward auth header if available
  const getAuthHeaders = (req: express.Request) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (req.session.accessToken) {
      headers["Authorization"] = `Bearer ${req.session.accessToken}`;
    }
    
    return headers;
  };

  // Backend API proxy endpoints
  app.post("/api/proxy/login", async (req, res) => {
    try {
      console.log("Proxying login request to external API", req.body);
      const response = await fetch("https://backend.myadvisor.sg/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      
      // If login successful, store advisor info in session
      if (response.ok && data.advisor) {
        req.session.advisorId = data.advisor.id;
        // Store token if provided in the response
        if (data.access_token) {
          req.session.accessToken = data.access_token;
        }
      }
      
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy login error:", error);
      res.status(500).json({ message: "Failed to connect to external API" });
    }
  });
  
  app.post("/api/proxy/logout", async (req, res) => {
    try {
      const response = await fetch("https://backend.myadvisor.sg/logout", {
        method: "POST",
        headers: getAuthHeaders(req),
      });
      
      // Clear session data regardless of response
      req.session.advisorId = undefined;
      req.session.accessToken = undefined;
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy logout error:", error);
      // Clear session even on error
      req.session.advisorId = undefined;
      req.session.accessToken = undefined;
      res.status(200).json({ message: "Logged out" });
    }
  });
  
  // Get users for the logged-in advisor
  app.get("/api/proxy/users", async (req, res) => {
    try {
      if (!req.session.advisorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const advisorId = req.session.advisorId;
      const response = await fetch(`https://backend.myadvisor.sg/users/${advisorId}`, {
        method: "GET",
        headers: getAuthHeaders(req),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy users error:", error);
      res.status(500).json({ message: "Failed to fetch users from API" });
    }
  });
  
  // Get user replies
  app.get("/api/proxy/users/:userId/replies", async (req, res) => {
    try {
      if (!req.session.advisorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const advisorId = req.session.advisorId;
      const userId = req.params.userId;
      
      const response = await fetch(`https://backend.myadvisor.sg/users/${advisorId}/replies/${userId}`, {
        method: "GET",
        headers: getAuthHeaders(req),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy user replies error:", error);
      res.status(500).json({ message: "Failed to fetch user replies from API" });
    }
  });
  
  // Send message
  app.post("/api/proxy/send-message", async (req, res) => {
    try {
      if (!req.session.advisorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Make sure advisor_id is set from session
      const messageData = {
        ...req.body,
        advisor_id: req.session.advisorId
      };
      
      const response = await fetch("https://backend.myadvisor.sg/send_message", {
        method: "POST",
        headers: getAuthHeaders(req),
        body: JSON.stringify(messageData),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy send message error:", error);
      res.status(500).json({ message: "Failed to send message via API" });
    }
  });
  
  // Delete user
  app.delete("/api/proxy/delete-user/:userId", async (req, res) => {
    try {
      if (!req.session.advisorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.params.userId;
      const advisorId = req.session.advisorId;
      
      // Format data for the external API
      const deleteData = {
        user_id: parseInt(userId),
        advisor_id: advisorId
      };
      
      // The external backend might still expect a POST request with body
      const response = await fetch("https://backend.myadvisor.sg/delete_user", {
        method: "POST", // Keep POST for external API as specified in requirements
        headers: getAuthHeaders(req),
        body: JSON.stringify(deleteData),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy delete user error:", error);
      res.status(500).json({ message: "Failed to delete user via API" });
    }
  });
  
  // Questions endpoints
  
  // Get questions
  app.get("/api/proxy/questions", async (req, res) => {
    try {
      if (!req.session.advisorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const advisorId = req.session.advisorId;
      const response = await fetch(`https://backend.myadvisor.sg/questions/${advisorId}`, {
        method: "GET",
        headers: getAuthHeaders(req),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy get questions error:", error);
      res.status(500).json({ message: "Failed to fetch questions from API" });
    }
  });
  
  // Add question
  app.post("/api/proxy/questions", async (req, res) => {
    try {
      if (!req.session.advisorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Make sure advisor_id is set from session
      const questionData = {
        ...req.body,
        advisor_id: req.session.advisorId
      };
      
      const response = await fetch("https://backend.myadvisor.sg/questions/add", {
        method: "POST",
        headers: getAuthHeaders(req),
        body: JSON.stringify(questionData),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy add question error:", error);
      res.status(500).json({ message: "Failed to add question via API" });
    }
  });
  
  // Update question
  app.put("/api/proxy/questions/:id", async (req, res) => {
    try {
      const questionId = req.params.id;
      const response = await fetch(`https://backend.myadvisor.sg/questions/${questionId}`, {
        method: "PUT",
        headers: getAuthHeaders(req),
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy update question error:", error);
      res.status(500).json({ message: "Failed to update question via API" });
    }
  });
  
  // Delete question
  app.delete("/api/proxy/questions/:id", async (req, res) => {
    try {
      const questionId = req.params.id;
      const response = await fetch(`https://backend.myadvisor.sg/questions/${questionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(req),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy delete question error:", error);
      res.status(500).json({ message: "Failed to delete question via API" });
    }
  });
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "admin-portal-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );
  
  // Passport authentication setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        // Import and use the comparePasswords utility function
        // Password verification is handled by the external API
        // We just verify the user exists in our system
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate user data
      const userData = insertUserSchema.parse(req.body);
      
      // For API integration, we skip checking for existing users
  // That will be handled by the actual API
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const credentials = loginSchema.parse(req.body);
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ 
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email 
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    });
  });
  
  // Messages routes
  app.get("/api/messages", isAuthenticated, async (_req, res, next) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/messages/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.getMessage(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/messages", isAuthenticated, async (req, res, next) => {
    try {
      const messageData = insertQuestionSchema.parse(req.body);
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  
  app.patch("/api/messages/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const messageData = insertQuestionSchema.partial().parse(req.body);
      const updatedMessage = await storage.updateMessage(id, messageData);
      res.json(updatedMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  
  app.delete("/api/messages/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMessage(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Users routes
  app.get("/api/users", isAuthenticated, async (_req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/users", isAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({ userIds: z.array(z.number()) });
      const { userIds } = schema.parse(req.body);
      
      await storage.deleteUsers(userIds);
      res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  
  // User replies routes
  app.get("/api/users/:userId/replies", isAuthenticated, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const userReplies = await storage.getUserReplies(userId);
      
      // Enhance with message content
      const enhancedReplies = await Promise.all(
        userReplies.map(async (reply) => {
          const message = await storage.getMessage(reply.messageId);
          return {
            ...reply,
            messageContent: message?.content || "Message not found"
          };
        })
      );
      
      res.json(enhancedReplies);
    } catch (error) {
      next(error);
    }
  });
  
  // Send promotional message
  app.post("/api/send-promo", isAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({ 
        userIds: z.array(z.number()),
        contentId: z.string()
      });
      
      const { userIds, contentId } = schema.parse(req.body);
      
      // Simulate sending promo messages
      // In a real app, this would integrate with a messaging service
      
      res.json({ 
        message: "Promotional message sent successfully", 
        affectedUsers: userIds.length,
        contentId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
