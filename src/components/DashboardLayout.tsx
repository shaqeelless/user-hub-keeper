import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Outlet } from "react-router-dom";
import { List, BookOpen, Film, Users } from "lucide-react";

const DashboardLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                to="/dashboard" 
                className="flex items-center px-2 py-2 text-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/todos"
                className="ml-8 flex items-center px-2 py-2 text-foreground hover:text-primary transition-colors"
              >
                <List className="mr-2 h-4 w-4" />
                Todos
              </Link>
              <Link
                to="/dashboard/quizzes"
                className="ml-8 flex items-center px-2 py-2 text-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Quizzes
              </Link>
              <Link
                to="/dashboard/movies"
                className="ml-8 flex items-center px-2 py-2 text-foreground hover:text-primary transition-colors"
              >
                <Film className="mr-2 h-4 w-4" />
                Movies
              </Link>
              <Link
                to="/dashboard/users"
                className="ml-8 flex items-center px-2 py-2 text-foreground hover:text-primary transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={logout}
                className="text-foreground hover:text-primary hover:bg-background"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;