import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn(
    "VITE_API_BASE_URL is NOT set. Axios will call the Vite dev server instead of the API."
  );
}

export const api = axios.create({
  baseURL
});
