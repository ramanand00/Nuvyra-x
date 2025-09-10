// app/config/constants.ts
// Get the development URL from Expo
let API_BASE_URL: string;

if (__DEV__) {
  // In development, use your computer's IP with http://
  API_BASE_URL = 'http://192.168.18.28:5000/api';
} else {
  // In production, use your production server URL
  API_BASE_URL = 'https://your-production-server.com/api';
}

// Fallback for web or other environments
if (!API_BASE_URL) {
  API_BASE_URL = 'http://localhost:5000/api';
}

export { API_BASE_URL };