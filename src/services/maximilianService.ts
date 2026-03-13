import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const maximilianService = axios.create({
  baseURL: import.meta.env.VITE_API_URL!,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

maximilianService.interceptors.request.use(
  async (config) => {
    try {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      const selectedRoleId = sessionStorage.getItem("selected_role_id");

      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }

      if (selectedRoleId) {
        config.headers.idRol = selectedRoleId;
      }
    } catch (error) {
      console.error("Error fetching Cognito token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default maximilianService;
