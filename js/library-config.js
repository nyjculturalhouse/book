/* 국립중앙도서관 서지 검색: 키 발급 전에는 요청하지 않습니다.
 * 실제 인증키는 공개 HTML/JavaScript에 넣지 않고 서버에서 관리하세요.
 * 대여/회원 관리용 GAS_API_URL과는 별개의 외부 검색 서비스입니다.
 */
const NATIONAL_LIBRARY_SEARCH = Object.freeze({
  endpoint: 'https://www.nl.go.kr/NL/search/openApi/search.do',
  status: 'pending-key',
  checkUrl: 'https://www.nl.go.kr/NL/search/openApi/search.do?key=&kwd=%ED%86%A0%EC%A7%80'
});
