// utils/axiosInterceptor.js
import axios from "axios";
import Config from "../utils/GlobalConfig";

const setupInterceptors = (logout) => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If token is expired and we haven't tried to refresh yet
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Call token refresh endpoint
          const response = await axios.post(
            `${Config.API_BASE_URL}/refresh-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Update token in storage
          localStorage.setItem("token", response.data.token);

          // Retry the original request with new token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout user
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
