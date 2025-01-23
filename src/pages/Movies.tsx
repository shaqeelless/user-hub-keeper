import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Movie } from "@/types/movie";
import { getPopularMovies, searchMovies, getImageUrl } from "@/services/tmdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPopularMovies();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to fetch movies. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch movies. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMovies();
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const results = await searchMovies(searchQuery);
      setMovies(results);
    } catch (error) {
      console.error("Error searching movies:", error);
      setError("Failed to search movies. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search movies. Please try again later.",
      });
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movie Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">Loading movies...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movie Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 p-8">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchMovies}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movie Catalog</CardTitle>
        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="max-w-sm"
          />
          <Button type="submit" disabled={searching}>
            <Search className="h-4 w-4 mr-2" />
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/dashboard/movies/${movie.id}`}
              className="group"
            >
              <div className="border rounded-lg overflow-hidden transition-all hover:shadow-lg">
                {movie.poster_path ? (
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {movie.vote_average.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Movies;