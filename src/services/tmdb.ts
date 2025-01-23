import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

async function getApiKey() {
  try {
    const { data, error } = await supabase.functions.invoke("get-secret", {
      body: { name: "TMDB_API_KEY" }
    });
    
    if (error) {
      console.error("Error fetching API key:", error);
      throw new Error("Failed to get API key");
    }
    
    if (!data?.secret) {
      throw new Error("API key not found");
    }
    
    return data.secret;
  } catch (error) {
    console.error("Error in getApiKey:", error);
    throw error;
  }
}

export async function searchMovies(query: string) {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
}

export async function getPopularMovies(page = 1) {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${apiKey}&page=${page}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw error;
  }
}

export async function getMovieDetails(id: number) {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
}

export function getImageUrl(path: string | null, size: "w500" | "original" = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}