// js/api.js - 중앙 집중식 API 핸들러
const API_URL = 'https://script.google.com/macros/s/AKfycbxZ4dwowNFhbel7BefxftDMj5dPp8A3t51QKCn4C3Oqu0SkVSXz3g0zgYB2OmqlGw7S/exec';

let currentAbortController = null;

async function fetchAPI(action, payload = null, method = 'GET') {
  if (currentAbortController && method === 'GET') {
    currentAbortController.abort();
  }
  
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    // 2. 아래 부분을 반드시 API_URL로 수정해야 합니다
    let url = `${API_URL}?action=${action}`; 
    let options = { method, signal };

    if (method === 'GET' && payload) {
      const params = new URLSearchParams(payload);
      url += `&${params.toString()}`;
    } else if (method === 'POST') {
      options.body = JSON.stringify(payload);
      options.headers = { 'Content-Type': 'text/plain' };
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
