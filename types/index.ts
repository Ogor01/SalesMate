export interface User {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  userId: string;
  productName: string;
  description: string;
  price: number; // in kobo
  imageUrl?: string | null;
  colorOptions: string[];
  sizeOptions: string[];
  inStock: boolean;
  createdAt: Date;
}

export interface FAQ {
  id: string;
  userId: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";

export interface Lead {
  id: string;
  userId: string;
  customerName?: string | null;
  phoneNumber: string;
  productInterest?: string | null;
  leadStatus: LeadStatus;
  createdAt: Date;
}

export interface ChatMessage {
  role: "customer" | "ai" | "vendor";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  customerPhone: string;
  conversationHistory: ChatMessage[];
  aiConfidenceScore: number;
  isEscalated: boolean;
  createdAt: Date;
}
