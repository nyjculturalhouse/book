# book
## 국립중앙도서관 검색 API 준비 상태

- 상태: 인증키 발급 대기. 아직 연동되지 않았습니다.
- 설정 안내: `js/library-config.js`
- 검색 주소: `https://www.nl.go.kr/NL/search/openApi/search.do`
- 전달받은 확인 주소: `https://www.nl.go.kr/NL/search/openApi/search.do?key=&kwd=%ED%86%A0%EC%A7%80`
- 위 주소의 `key`는 비어 있습니다. 정상 검색 응답 여부는 확인되지 않았습니다.
- 키가 발급되면 서버 측에 저장하고 응답 형식 및 브라우저 접근 제약을 확인한 뒤 연결합니다. 공개 저장소나 HTML 시안에 인증키를 넣지 않습니다.
- 기존 Google Apps Script API는 로그인, 보유 도서, 대여/반납을 처리하는 별도 연결입니다.
