/* =========================================================
   소소책방 공통 앱 스크립트
   - 로그인 가드 (비로그인 시 로그인 페이지로 이동)
   - 로그아웃 처리
   - 홈 화면(index.html) 데이터 렌더링
   모든 페이지에서 가장 먼저 로드된다.
========================================================= */

(function authGuard() {
  const isLoginPage = location.pathname.endsWith('login.html');
  const user = JSON.parse(localStorage.getItem('sosoUser') || 'null');

  if (!user && !isLoginPage) {
    location.href = 'login.html';
  }
  if (user && isLoginPage) {
    location.href = 'index.html';
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // ---------- 로그아웃 ----------
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('sosoUser');
      location.href = 'login.html';
    });
  }

  // ---------- 홈 상단 검색창 (index.html) ----------
  const homeSearchForm = document.getElementById('homeSearchForm');
  if (homeSearchForm) {
    homeSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('homeSearchInput').value.trim();
      location.href = q ? `books.html?q=${encodeURIComponent(q)}` : 'books.html';
    });
  }

  // ---------- 홈 데이터 렌더링 (index.html에서만 실행) ----------
  const newBooksList = document.getElementById('newBooksList');
  if (!newBooksList) return;

  loadHomeData();
});

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

    // 신간 도서 8권
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
            <h4 class="text-sm font-bold truncate">${book['도서명']}</h4>
            <p class="text-xs text-gray-500 truncate">${book['저자']}</p>
          </div>
          <span class="text-xs text-gray-400 shrink-0">대여 ${book['대여횟수']}회</span>
        </a>
      `).join('');
    }

    // 카테고리 바로가기
    if (data.categories && data.categories.length > 0) {
      categoryList.innerHTML = data.categories.map((cat) => `
        <a href="books.html?category=${encodeURIComponent(cat)}" class="shrink-0 px-5 py-2.5 rounded-full bg-container shadow-soft text-sm font-bold hover:bg-primary hover:text-white transition-colors">
          ${cat}
        </a>
      `).join('');
    } else {
      categoryList.innerHTML = '';
    }
  } catch (err) {
    newBooksList.innerHTML = '<div class="col-span-full text-center text-red-400 py-12">도서 정보를 불러오는데 실패했습니다.</div>';
    popularBooksList.innerHTML = '';
  }
}

function renderBookCard(book) {
  const isAvail = book['상태'] === '대여가능';

  return `
    <a href="books.html?q=${encodeURIComponent(book['도서명'])}"
       class="flex items-center gap-4 bg-container rounded-xl p-3 shadow-soft hover:shadow-lg transition-shadow slide-up">

      <div class="relative shrink-0">
        <img
          src="${book['표지URL']}"
          loading="lazy"
          class="w-14 h-20 object-cover rounded bg-surface">

        ${
          !isAvail
            ? `<div class="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-[11px] font-bold text-white">
                대여중
              </div>`
            : ''
        }
      </div>

      <div class="flex-1 min-w-0">

        <span class="text-xs font-bold text-accent-bg">
          ${book['카테고리'] || '일반'}
        </span>

        <h3 class="mt-1 text-base font-bold tracking-[-0.03em] leading-tight truncate">
          ${book['도서명']}
        </h3>

        <p class="mt-1 text-sm text-gray-500 tracking-[-0.01em] leading-6 truncate">
          ${book['저자']} · ${book['출판사']}
        </p>

      </div>

      <div class="shrink-0">
        <span class="
          inline-flex
          items-center
          justify-center
          px-4
          py-2
          rounded-lg
          text-sm
          font-semibold
          transition-colors
          ${isAvail
            ? 'bg-primary text-white hover:bg-primary-hover'
            : 'bg-gray-200 text-gray-400'}
        ">
          ${isAvail ? '대여 바로가기' : '대여불가'}
        </span>
      </div>

    </a>
  `;
}
