// js/api.js - 중앙 집중식 API 핸들러
const API_URL = 'https://script.google.com/macros/s/AKfycbzZbp24UapwuJ7WyTeRn9q3prOeQSdey2mPsV_EUjX0Lwn9x0hn1_0WmUyJMagbx1Ct/exec';

export const callAPI = async (action, params = {}) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // GAS 웹앱 연동 시 필요
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params })
    });
    
    // 실제 운영 시에는 응답 데이터 처리 로직 추가
    return await response.json();
  } catch (error) {
    console.error('API 통신 오류:', error);
    throw error;
  }
};
