import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/bookings";

export interface BookingRequest {
  movieId: number;
  userEmail: string;
  seats: number;
  totalPrice: number;
}

export const createBooking = async (bookingData: BookingRequest) => {
  try {
    const response = await axios.post(API_BASE_URL, bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const getAllBookings = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const deleteBooking = async (id: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting booking:", error);
  }
};

export const getBookingsByUser = async (userEmail: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?userEmail=${userEmail}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
};
