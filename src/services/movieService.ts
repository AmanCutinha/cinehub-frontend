import axios from "axios";
import { Movie } from "@/types";

const API_BASE_URL = "http://localhost:8081/api/movies";

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data; // Must be an array of movies
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};
