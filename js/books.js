/* =========================================================
   도서검색 페이지 전용 스크립트
   - 서버 사이드 검색/페이지네이션 (20권씩, 무한스크롤)
   - Debounce 300ms
   - 카테고리 필터
========================================================= */

let currentPage = 1;
let isFetching = false;
let hasMoreData = true;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', async () => {

  if (!document.getElementById('booksList')) return;


  const searchInput = document.getElementById('searchInput');
  const availableOnly = document.getElementById('availableOnly');
  const availableBtn = document.getElementById('availableBtn');
  const sortSelect = document.getElementById('sortSelect');
  const categorySelect = document.getElementById('categorySelect');

if (availableBtn) {

  availableBtn.addEventListener("click", () => {

      availableOnly.checked = !availableOnly.checked;

      if (availableOnly.checked) {
          availableBtn.classList.remove(
              "bg-white",
              "text-gray-700"
          );

          availableBtn.classList.add(
              "bg-[#FF5A36]",
              "text-white"
          );

      } else {
          availableBtn.classList.remove(
              "bg-[#FF5A36]",
              "text-white"
          );

          availableBtn.classList.add(
              "bg-white",
              "text-gray-700"
          );
      }

      loadBooks(true);

  });

}

  // URL 쿼리 파라미터 처리
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('q')) {
    searchInput.value = urlParams.get('q');
  }

  if (urlParams.has('sort')) {
    sortSelect.value = urlParams.get('sort');
  }

  if (urlParams.has('category')) {
    currentCategory = urlParams.get('category');
    if (categorySelect) {
      categorySelect.value = currentCategory;
    }
  }

  const loadBooks = async (reset = false) => {
    if (isFetching || (!hasMoreData && !reset)) return;
    isFetching = true;

    if (reset) {
      currentPage = 1;
      hasMoreData = true;
      document.getElementById('booksList').innerHTML = UI.renderBookSkeleton(8);
    } else {
      document.getElementById('loadingTrigger').innerHTML =
        '<span class="material-symbols-outlined animate-spin text-gray-400">progress_activity</span>';
    }

    try {
      const query = searchInput.value;
      const filter = availableOnly.checked ? 'available' : 'all';
      const sort = sortSelect.value;

      const data = await fetchAPI('searchBooks', {
        query,
        filter,
        sort,
        page: currentPage,
        category: currentCategory || undefined
      });

      if (!data) return;

      hasMoreData = data.hasMore;

      const html = data.items.map(renderCard).join('');

      const list = document.getElementById('booksList');

      if (reset) {
        list.innerHTML =
          html ||
          '<div class="col-span-full text-center text-gray-400 py-12">검색 결과가 없습니다.</div>';
      } else {
        list.insertAdjacentHTML('beforeend', html);
      }

      currentPage++;
    } catch (err) {
      if (reset) {
        document.getElementById('booksList').innerHTML = `
          <div class="col-span-full text-center text-gray-500 py-12">
            ${err.message || '검색 중 오류가 발생했습니다.'}
          </div>
        `;
      }
    } finally {
      isFetching = false;
      document.getElementById('loadingTrigger').innerHTML = '';
    }
  };

  const debouncedSearch = Utils.debounce(() => loadBooks(true), 300);

if (searchInput) {
  searchInput.addEventListener('input', debouncedSearch);
}

if (availableOnly) {
  availableOnly.addEventListener('change', () => {
    loadBooks(true);
  });
}

if(sortSelect){
  sortSelect.addEventListener('change', () => {
    loadBooks(true);
  });
}

  // ==========================
  // 카테고리 변경
  // ==========================
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      currentCategory = categorySelect.value || null;
      loadBooks(true);
    });
  }

  // Intersection Observer for Infinite Scroll
  const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadBooks(false);
  }
}, {
  rootMargin: '100px'
});

observer.observe(document.getElementById('loadingTrigger'));

if (categorySelect) {
  const homeData = await fetchAPI('getHome', {});

  if (homeData && homeData.categories) {
    categorySelect.innerHTML = `
      <option value="">전체 카테고리</option>
      ${homeData.categories.map(cat => `
        <option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>
          ${cat}
        </option>
      `).join('')}
    `;
  }
}
   
  loadBooks(true);
});

function renderCard(book) {

  const isAvail = book['상태'] === '대여가능';

  const safeTitleForJs = UI.escapeJs(book['도서명']);
  const safeIsbnForJs = UI.escapeJs(book['ISBN']);

  return `
    <div class="bg-container rounded-xl p-3 shadow-soft hover:shadow-lg transition-all">

      <div class="flex items-center gap-4">


        <!-- 책 표지 -->
        <img
          src="${book['표지URL']}"
          loading="lazy"
          class="w-12 h-16 rounded-lg object-cover bg-surface shrink-0">



        <!-- 제목 / 저자 / 출판사 -->
        <div class="flex-1 min-w-0">


          <h3 class="text-base font-bold tracking-[-0.03em] leading-tight truncate">
            ${UI.escapeHtml(book['도서명'])}
          </h3>


          <p class="mt-1 text-sm text-gray-500 tracking-[-0.01em] leading-6 truncate">
            ${UI.escapeHtml(book['저자'])}
            ·
            ${UI.escapeHtml(book['출판사'])}
          </p>


        </div>



        <!-- 위치 / 카테고리 / 버튼 -->
        <div class="flex items-center gap-4 shrink-0">


          <!-- 위치 -->
          <div class="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">

            <span class="material-symbols-outlined text-[18px] text-[#E04825]">
              location_on
            </span>

            ${UI.formatLocation(book['위치'])}

          </div>



          <!-- 카테고리 -->
          <span class="text-sm font-semibold text-[#E04825] whitespace-nowrap">

            ${UI.escapeHtml(book['카테고리']) || '일반'}

          </span>




          <!-- 대여 버튼 -->
          <button
            onclick="rentBook('${safeIsbnForJs}','${safeTitleForJs}')"

            class="
              px-4
              py-2
              rounded-lg
              text-sm
              font-semibold
              whitespace-nowrap
              transition-all
              ${
                isAvail
                ? 'bg-[#E04825] text-white hover:bg-[#C63D20]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            "

            ${!isAvail ? 'disabled' : ''}>

            ${isAvail ? '대여하기' : '대여중'}

          </button>


        </div>


      </div>

    </div>
  `;
}

window.rentBook = (isbn, title) => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14);

  const desc = `
    <b class="text-primary">${UI.escapeHtml(title)}</b><br><br>
    반납예정일:
    <span class="text-accent-bg font-bold">
      ${Utils.formatDate(dueDate)}
    </span>
  `;

  UI.showModal('대여하시겠습니까?', desc, '대여', async () => {
    try {
      await fetchAPI('rentBook', {
        userId: user.id,
        isbn
      }, 'POST');

      invalidateFetchCache();

      UI.showToast('대여가 완료되었습니다.');

      setTimeout(() => window.location.reload(), 1000);

    } catch (err) {
      UI.showModal('대여 불가', err.message, '확인', () => {});
      throw err;
    }
  });
};
