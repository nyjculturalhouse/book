/* =========================================================
   소소책방 API 통신 모듈
   Google Apps Script(Web App)와 통신하는 유일한 창구

   ⚠️ 중요: 아래 GAS_API_URL 을 배포한 본인의 GAS 웹앱 URL로 교체하세요.
   Apps Script 편집기 > 배포 > 새 배포 > 유형: 웹 앱
   실행: 나(본인) / 액세스 권한: 모든 사용자
   배포 후 나오는 URL을 그대로 붙여넣으면 됩니다.
========================================================= */

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxZ4dwowNFhbel7BefxftDMj5dPp8A3t51QKCn4C3Oqu0SkVSXz3g0zgYB2OmqlGw7S/exec';

// 진행 중인 요청을 액션별로 추적 (같은 액션의 이전 요청은 새 요청 시 취소)
const _activeControllers = {};

// GET 요청 결과 초단기 캐시 (같은 화면에서 중복 fetch 방지, 5초 TTL)
const _fetchCache = new Map();
const FETCH_CACHE_TTL = 5000;

/**
 * GAS 백엔드 호출
 * @param {string} action - GAS doGet/doPost 라우터의 액션명
 * @param {object} params - 전달할 파라미터
 * @param {'GET'|'POST'} method - GET(조회)은 캐시/취소 대상, POST(변경)는 즉시 실행
 * @returns {Promise<any>} 서버가 반환한 data 필드
 */
async function fetchAPI(action, params = {}, method = 'GET') {
  // 이전에 나가있던 같은 액션의 요청은 취소 (검색 debounce 시 필수)
  if (_activeControllers[action]) {
    _activeControllers[action].abort();
  }
  const controller = new AbortController();
  _activeControllers[action] = controller;

  try {
    let response;

    if (method === 'GET') {
      const cacheKey = action + JSON.stringify(params);
      const cached = _fetchCache.get(cacheKey);
      if (cached && Date.now() - cached.time < FETCH_CACHE_TTL) {
        return cached.data;
      }

      const query = new URLSearchParams({ action, ...flattenParams(params) }).toString();
      response = await fetch(`${GAS_API_URL}?${query}`, {
        method: 'GET',
        signal: controller.signal
      });

      const json = await parseResponse(response);
      _fetchCache.set(cacheKey, { data: json, time: Date.now() });
      return json;
    } else {
      // POST 요청은 반드시 text/plain 으로 전송한다.
      // GAS 웹앱은 CORS Preflight(OPTIONS)에 응답하지 않으므로,
      // application/json 헤더를 쓰면 브라우저가 preflight를 보내 요청이 막힌다(CORS 에러의 주요 원인).
      // text/plain은 "simple request"로 분류되어 preflight 없이 바로 전송된다.
      response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...params }),
        signal: controller.signal
      });

      return await parseResponse(response);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // 새 요청이 이전 요청을 대체한 것 — 정상 흐름이므로 null 반환 (호출부에서 무시)
      return null;
    }
    // 네트워크 자체가 끊긴 경우 사용자에게 이해하기 쉬운 메시지 제공
    if (err.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 인터넷 연결 또는 GAS 배포 상태를 확인해주세요.');
    }
    throw err;
  } finally {
    if (_activeControllers[action] === controller) {
      delete _activeControllers[action];
    }
  }
}

/**
 * 서버 응답을 파싱하고, 서버가 보낸 에러 메시지를 Error로 변환
 */
async function parseResponse(response) {
  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw new Error('서버 응답을 처리할 수 없습니다. GAS 배포 설정을 확인해주세요.');
  }

  if (!response.ok || json.success === false) {
    throw new Error(json.message || '요청 처리 중 오류가 발생했습니다.');
  }

  return json.data;
}

/**
 * URLSearchParams에 들어갈 수 있도록 undefined/null 값 제거
 */
function flattenParams(params) {
  const result = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      result[key] = params[key];
    }
  });
  return result;
}

/**
 * 쓰기 작업(대여/반납/탈퇴 등) 성공 후 GET 캐시를 무효화
 * — 대여 후 검색 결과가 바로 갱신되도록
 */
function invalidateFetchCache() {
  _fetchCache.clear();
}
