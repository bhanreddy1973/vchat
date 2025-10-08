import axios from 'axios';

// ✅ Use different URLs for development vs production
const baseURL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api'  // ✅ Development: Backend server
  : '/api';                      // ✅ Production: Same domain

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

// ✅ Add some logging to debug
console.log('🔗 API Base URL:', baseURL);
console.log('🌍 Environment Mode:', import.meta.env.MODE);

export default axiosInstance;