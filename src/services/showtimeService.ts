import axios from "axios";
import { Showtime } from "@/types";

const API_BASE_URL = "http://localhost:8081/api/showtimes";

export const getShowtimesByMovie = async (movieId: number): Promise<Showtime[]> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/movie/${movieId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    return [];
  }
};
