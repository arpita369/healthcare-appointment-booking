import axios from 'axios';

const gatewayBase = process.env.REACT_APP_API_BASE || 'http://localhost:9094';

const authBase = gatewayBase; 
const userMgmtBase = gatewayBase; 
const appointmentBase =  gatewayBase;
 
const makeClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: false,
  });
  client.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('healthcare_token');
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      const isAuthPublic = /\/api\/v1\/user\/(login|register|validate-token)/.test(fullUrl);
      if (!isAuthPublic && token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  });
  return client;
};

const api = makeClient(gatewayBase);
 
export const authApi = makeClient(authBase);
export const userMgmtApi = makeClient(userMgmtBase);
export const appointmentApi = makeClient(appointmentBase);
 
export default api;
