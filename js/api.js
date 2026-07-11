// js/api.js - 중앙 집중식 API 핸들러
const API_URL = 'https://script.google.com/macros/s/AKfycbzZbp24UapwuJ7WyTeRn9q3prOeQSdey2mPsV_EUjX0Lwn9x0hn1_0WmUyJMagbx1Ct/exec';

export const fetchData = async (funcName, params) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(`${API_URL}?func=${funcName}`, {
      method: 'POST',
      body: JSON.stringify(params),
      signal: controller.signal
    });
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};
