// ============================================
// User Model - TypeScript Interfaces
// Database ke User table ka TypeScript representation
// Yeh interfaces pure type safety ke liye hain
// ============================================

// Database se milne wala full User object
export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // Hashed password - kabhi expose mat karo
  createdAt: Date;
  updatedAt: Date;
}

// API response mein dene wala User object (password nahi hoga)
export interface UserPublic {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Naya user create karte waqt jo data chahiye
export interface CreateUserDto {
  name: string;
  email: string;
  password: string; // Hashed hoga service layer mein
}

// User profile update karte waqt
export interface UpdateUserDto {
  name?: string;
  email?: string;
}

// Login ke baad milne wala response
export interface AuthResponse {
  user: UserPublic;
  token: string; // JWT token
}
