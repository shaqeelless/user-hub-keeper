import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MovieDetails as IMovieDetails } from "@/types/movie";
import { getMovieDetails, getImageUrl } from "@/services/tmdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<IMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieDetails(Number(id));
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!movie) {
    return <div className="flex justify-center p-8">Movie not found</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {movie.backdrop_path && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={getImageUrl(movie.backdrop_path, "original")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardTitle className="text-3xl mt-4">{movie.title}</CardTitle>
        {movie.tagline && (
          <p className="text-muted-foreground italic">{movie.tagline}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <span>{new Date(movie.release_date).getFullYear()}</span>
          <span>{movie.runtime} minutes</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            {movie.vote_average.toFixed(1)}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {movie.genres.map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-1 bg-primary/10 rounded-full text-xs"
            >
              {genre.name}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground">{movie.overview}</p>
      </CardContent>
    </Card>
  );
};

export default MovieDetails;