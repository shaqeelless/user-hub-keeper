import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Outlet } from "react-router-dom";
import { List, BookOpen, Film } from "lucide-react";

const DashboardLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center px-2 py-2 text-gray-900">
                Dashboard
              </Link>
              <Link
                to="/dashboard/todos"
                className="ml-8 flex items-center px-2 py-2 text-gray-900"
              >
                <List className="mr-2 h-4 w-4" />
                Todos
              </Link>
              <Link
                to="/dashboard/quizzes"
                className="ml-8 flex items-center px-2 py-2 text-gray-900"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Quizzes
              </Link>
              <Link
                to="/dashboard/movies"
                className="ml-8 flex items-center px-2 py-2 text-gray-900"
              >
                <Film className="mr-2 h-4 w-4" />
                Movies
              </Link>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={logout}
                className="text-gray-900"
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