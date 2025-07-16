
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', // This hits Vercel's API route when deployed
});

export default instance;
