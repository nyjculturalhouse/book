/* =========================================================
   소소책방 공통 앱 스크립트
   - 로그인 가드 & 로그아웃 처리
   - 홈 화면(index.html) 데이터 렌더링 및 UI 테마 보정
   - 전역 라이선스 푸터 자동 삽입 로직 포함
========================================================= */

(function authGuard() {
  const isLoginPage = location.pathname.endsWith('login.html');

  const user = JSON.parse(localStorage.getItem('sosoUser') || 'null');
  const loginTime = Number(localStorage.getItem('loginTime') || 0);

  const LIMIT = 10 * 60 * 1000; // 10분

  // 로그인 만료
  if (user && loginTime && (Date.now() - loginTime > LIMIT)) {
    localStorage.removeItem('sosoUser');
    localStorage.removeItem('loginTime');
  }

  const currentUser = JSON.parse(localStorage.getItem('sosoUser') || 'null');

  if (!currentUser && !isLoginPage) {
    location.href = 'login.html';
  }

  if (currentUser && isLoginPage) {
    location.href = 'index.html';
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // 📌 [공통] 전역 푸터 자동 삽입
  injectLicenseFooter();

  // ===========================
  // 자동 로그아웃 (추가)
  // ===========================
  const loginTime = Number(localStorage.getItem('loginTime') || 0);

  if (loginTime) {

    const LIMIT = 10 * 60 * 1000;
    const remain = LIMIT - (Date.now() - loginTime);

    if (remain <= 0) {

      localStorage.removeItem('sosoUser');
      localStorage.removeItem('loginTime');

      alert('로그인이 만료되었습니다.');

      location.href = 'login.html';
      return;
    }

    setTimeout(() => {

      localStorage.removeItem('sosoUser');
      localStorage.removeItem('loginTime');

      alert('10분이 지나 자동 로그아웃되었습니다.');

      location.href = 'login.html';

    }, remain);
  }

  // ---------- 로그아웃 ----------
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.classList.add('btn-bounce');
    logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('sosoUser');
    localStorage.removeItem('loginTime');
    location.href = 'login.html';
    });
  }

  // ---------- 홈 상단 검색창 ----------
  const homeSearchForm = document.getElementById('homeSearchForm');
  if (homeSearchForm) {
    const searchSubmitBtn = homeSearchForm.querySelector('button');
    if (searchSubmitBtn) searchSubmitBtn.classList.add('btn-bounce');

    homeSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('homeSearchInput').value.trim();
      location.href = q ? `books.html?q=${encodeURIComponent(q)}` : 'books.html';
    });
  }

  // ---------- 홈 데이터 렌더링 ----------
  const newBooksList = document.getElementById('newBooksList');
  if (!newBooksList) return;

  loadHomeData();
});

/**
 * 📌 동적 푸터 삽입 함수
 * HTML마다 일일이 푸터 코드를 복사 붙여넣기 하지 않아도 app.js가 로드되는 모든 페이지 하단에 자동으로 배치됩니다.
 */
function injectLicenseFooter() {
  if (document.getElementById('soso-license-footer')) return; // 중복 삽입 방지

  const isLoginPage = location.pathname.endsWith('login.html');

  const footer = document.createElement('footer');
  footer.id = 'soso-license-footer';

  if (isLoginPage) {
    // 📌 로그인 페이지는 body 자체가 `flex items-center justify-center`로 카드 1개만
    // 정중앙에 배치하는 특수 레이아웃이다. footer를 일반 흐름(형제 flex item)으로 넣으면
    // 카드가 왼쪽으로 밀리고 footer가 따로 떠버리는 정렬 붕괴가 발생하므로,
    // position:fixed로 흐름에서 완전히 빼내어 화면 하단 중앙에 고정한다.
    footer.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 text-center text-[11px] sm:text-[12px] font-light tracking-[-0.01em] text-gray-400/80 leading-relaxed';
  } else {
    // 가독성을 확보하고 스크롤 끝에 자연스럽게 안착하도록 세팅
    footer.className = 'mt-16 mb-24 w-full text-center text-[12px] sm:text-[14px] font-light tracking-[-0.01em] text-gray-400/90 leading-relaxed';
  }

  footer.innerHTML = `
    <p>
      본 사이트는 국민대학교 KMU80 성곡해옹 폰트를 사용하고 있습니다.<br>
      해당 폰트의 지식재산권은 국민대학교에 있으며 CC BY-ND(저작자표시-변경금지) 라이선스 조건에 따라 사용되었습니다.
    </p>
  `;
  document.body.appendChild(footer);
}

async function loadHomeData() {
  const newBooksList = document.getElementById('newBooksList');
  const popularBooksList = document.getElementById('popularBooksList');
  const categoryList = document.getElementById('categoryList');

  newBooksList.innerHTML = UI.renderBookSkeleton(8);
  popularBooksList.innerHTML = `
    <div class="flex flex-col gap-3">
      ${Array(5).fill('<div class="h-16 w-full skeleton"></div>').join('')}
    </div>
  `;

  try {
    const data = await fetchAPI('getHome', {});
    if (!data) return;

    // 신간 도서 10권
    if (!data.newBooks || data.newBooks.length === 0) {
      newBooksList.innerHTML = '<div class="col-span-full text-center text-gray-400 py-12">등록된 도서가 없습니다.</div>';
    } else {
      newBooksList.innerHTML = data.newBooks.map(renderBookCard).join('');
    }

    // 인기 도서 TOP5
    if (!data.popularBooks || data.popularBooks.length === 0) {
      popularBooksList.innerHTML = '<div class="text-center text-gray-400 py-8">대여 데이터가 아직 없습니다.</div>';
    } else {
      popularBooksList.innerHTML = data.popularBooks.map((book, idx) => `
        <a href="books.html?q=${encodeURIComponent(book['도서명'])}" class="flex items-center gap-4 bg-container rounded-xl p-3 shadow-soft hover:shadow-lg transition-shadow slide-up">
          <span class="text-xl font-bold w-6 text-center ${idx < 3 ? 'text-accent-bg' : 'text-gray-300'}">${idx + 1}</span>
          <img src="${book['표지URL']}" loading="lazy" class="w-10 h-14 object-cover rounded bg-surface shrink-0">
          <div class="flex-1 min-w-0">
            <h4 class="text-base font-bold tracking-[-0.03em] leading-tight truncate">
              ${book['도서명']}
            </h4>
            <p class="text-sm text-gray-500 tracking-[-0.01em] leading-6 truncate">
              ${book['저자']}
            </p>
          </div>
          <span class="text-sm font-semibold text-accent-bg shrink-0">
            대여 ${book['대여횟수']}회
          </span>
        </a>
      `).join('');
    }

    // 카테고리 바로가기
    if (categoryList && data.categories && data.categories.length > 0) {
      categoryList.innerHTML = data.categories.map((cat) => `
        <a href="books.html?category=${encodeURIComponent(cat)}"
           class="btn-bounce shrink-0 px-5 py-2.5 rounded-full bg-container shadow-soft text-sm font-bold hover:bg-accent-bg hover:text-white transition-colors">
          ${cat}
        </a>
      `).join('');
    } else if (categoryList) {
      categoryList.innerHTML = '';
    }
  } catch (err) {
    newBooksList.innerHTML = '<div class="col-span-full text-center text-red-400 py-12">도서 정보를 불러오는데 실패했습니다.</div>';
    popularBooksList.innerHTML = '';
  }
}

function renderBookCard(book) {
  const isAvail = book['상태'] === '대여가능';

  // 📌 대여 바로가기/대여하기 버튼에 !important 레벨의 강제 스타일 주입 (!text-white, !opacity-100)
  // 📌 기존 CSS 튕김 효과(btn-bounce)가 활성화되어도 글자가 상시 투명해지지 않고 완벽하게 보장됩니다.
  return `
    <div class="bg-container rounded-xl p-3 shadow-soft hover:shadow-lg transition-shadow slide-up">
      <div class="flex items-center gap-4">
        <img
          src="${book['표지URL']}"
          loading="lazy"
          class="w-10 h-14 object-cover rounded bg-surface shrink-0">

        <div class="flex-1 min-w-0">
          <h3 class="text-base font-bold tracking-[-0.03em] leading-tight truncate">
            ${book['도서명']}
          </h3>
          <p class="mt-1 text-sm text-gray-500 tracking-[-0.01em] leading-6 truncate">
            ${book['저자']} (${book['출판사']})
          </p>
        </div>

        <a
          href="books.html?q=${encodeURIComponent(book['도서명'])}"
          class="
            btn-bounce
            shrink-0
            px-4
            py-2
            rounded-lg
            text-sm
            font-semibold
            text-center
            inline-block
            transition-all
            ${
              isAvail
                ? 'bg-accent-bg !text-white !opacity-100 visible hover:bg-accent-hover'
                : 'bg-gray-200 text-gray-400 pointer-events-none'
            }
          ">
          ${isAvail ? '대여 바로가기' : '대여불가'}
        </a>
      </div>
    </div>
  `;
}
