import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  register: (email: string, password: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    console.log("Login attempt:", email);
    // Simulate API call
    setTimeout(() => {
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        lastLogin: new Date(),
      };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/dashboard");
    }, 1000);
  };

  const register = (email: string, password: string) => {
    console.log("Register attempt:", email);
    // Simulate API call
    setTimeout(() => {
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        lastLogin: new Date(),
      };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Registration successful",
        description: "Welcome to the application!",
      });
      navigate("/dashboard");
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};