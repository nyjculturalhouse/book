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

      // 🌟 [핵심 수정] 구글 서버(GAS)가 캐시를 강제로 새로 고치도록 무작위 타임스탬프(_t) 주입
      const queryParams = { 
        action, 
        ...flattenParams(params),
        _t: Date.now() // 캐시 방지용 파라미터
      };
      
      const query = new URLSearchParams(queryParams).toString();
      response = await fetch(`${GAS_API_URL}?${query}`, {
        method: 'GET',
        signal: controller.signal
      });

      const json = await parseResponse(response);
      _fetchCache.set(cacheKey, { data: json, time: Date.now() });
      return json;
    } else {
      // POST 요청 (동일)
      response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...params }),
        signal: controller.signal
      });

      return await parseResponse(response);
    }
  } catch (err) {
    // ... 에러 처리 동일 ...
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
