import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

export const fetchFoodItems = async (token) => {
  if (!token) throw new Error("Token is missing");
  const response = await axios.get(`${API_BASE_URL}food-items/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}login/`, credentials);
    return response.data; // Returns { token: '...' }
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userDetails) => {
  try {
    const response = await axios.post(`${API_BASE_URL}register/`, userDetails);
    return response.data;
  } catch (error) {
    console.error("Register API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const saveOrder = async (orderData, token) => {
  if (!token) throw new Error("Token is missing");
  const response = await axios.post(`${API_BASE_URL}user/orders/`, orderData, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const fetchUserOrders = async (token) => {
  if (!token) throw new Error("Token is missing");
  const response = await axios.get(`${API_BASE_URL}user/orders/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const fetchRecommendations = async (token) => {
  if (!token) throw new Error("Token is missing");
  const response = await axios.get(`${API_BASE_URL}recommendations/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
