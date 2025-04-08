import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema,
  insertMessageSchema, 
  insertReplySchema,
  insertUserSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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
        const { comparePasswords } = await import('./password-utils');
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
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
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const { hashPassword } = await import('./password-utils');
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
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
      const messageData = insertMessageSchema.parse(req.body);
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
      const messageData = insertMessageSchema.partial().parse(req.body);
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
      // Don't send passwords to the client
      const safeUsers = users.map(({ password, ...rest }) => rest);
      res.json(safeUsers);
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
