import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Film, PlusSquare, Trash2 } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  rating: number | null;
  release_year: number | null;
}

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch movies",
        variant: "destructive",
      });
    }
  };

  const addMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const { error } = await supabase.from("movies").insert([
        {
          title,
          description,
          genre,
          rating: rating ? parseFloat(rating) : null,
          release_year: releaseYear ? parseInt(releaseYear) : null,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      setGenre("");
      setRating("");
      setReleaseYear("");
      fetchMovies();
      toast({
        title: "Success",
        description: "Movie added successfully",
      });
    } catch (error) {
      console.error("Error adding movie:", error);
      toast({
        title: "Error",
        description: "Failed to add movie",
        variant: "destructive",
      });
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      const { error } = await supabase.from("movies").delete().eq("id", id);

      if (error) throw error;
      fetchMovies();
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movie Catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addMovie} className="space-y-4 mb-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Movie title"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Movie description"
          />
          <Input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
          />
          <Input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Rating (0-10)"
          />
          <Input
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            placeholder="Release year"
          />
          <Button type="submit">
            <PlusSquare className="mr-2" />
            Add Movie
          </Button>
        </form>
        <div className="grid gap-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <h3 className="font-semibold">{movie.title}</h3>
                {movie.description && (
                  <p className="text-sm text-gray-500">{movie.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  {movie.genre && <span>Genre: {movie.genre}</span>}
                  {movie.rating && (
                    <span className="ml-2">Rating: {movie.rating}/10</span>
                  )}
                  {movie.release_year && (
                    <span className="ml-2">Year: {movie.release_year}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Film className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMovie(movie.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Movies;