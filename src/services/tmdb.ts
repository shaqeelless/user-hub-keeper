import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

async function getApiKey() {
  const { data: { secret: apiKey } } = await supabase.functions.invoke("get-secret", {
    body: { name: "TMDB_API_KEY" }
  });
  return apiKey;
}

export async function searchMovies(query: string) {
  const apiKey = await getApiKey();
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results;
}

export async function getPopularMovies(page = 1) {
  const apiKey = await getApiKey();
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${apiKey}&page=${page}`
  );
  const data = await response.json();
  return data.results;
}

export async function getMovieDetails(id: number) {
  const apiKey = await getApiKey();
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${apiKey}`
  );
  return response.json();
}

export function getImageUrl(path: string | null, size: "w500" | "original" = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}