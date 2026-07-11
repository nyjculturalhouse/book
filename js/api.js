// js/api.js - 중앙 집중식 API 핸들러
const API_URL = 'https://script.google.com/macros/s/AKfycbzZbp24UapwuJ7WyTeRn9q3prOeQSdey2mPsV_EUjX0Lwn9x0hn1_0WmUyJMagbx1Ct/exec';

let currentAbortController = null;

async function fetchAPI(action, payload = null, method = 'GET') {
  if (currentAbortController && method === 'GET') {
    currentAbortController.abort(); // 기존 진행중인 GET 요청 취소
  }
  
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    let url = `${GAS_URL}?action=${action}`;
    let options = { method, signal };

    if (method === 'GET' && payload) {
      const params = new URLSearchParams(payload);
      url += `&${params.toString()}`;
    } else if (method === 'POST') {
      options.body = JSON.stringify(payload);
      options.headers = { 'Content-Type': 'text/plain' }; // GAS CORS 회피용
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!result.success) throw new Error(result.message || 'API 요청 실패');
    return result.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('요청 취소됨');
      return null;
    }
    console.error('API Error:', error);
    throw error;
  }
}

