// src/utils/uploadImage.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://user-management-system-4ttm.onrender.com';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await axios.post(`${API}/api/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // returns { url, key }
  return res.data;
}