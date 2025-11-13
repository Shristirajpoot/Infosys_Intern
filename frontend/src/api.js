// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const registerUser = (data) => API.post("/api/users/register", data);
export const loginUser = (data) => API.post("/api/users/login", data);
export const getUserProfile = () => API.get("/api/users/profile");

export default API;
