let currentPage = 1;
let isFetching = false;
let hasMoreData = true;

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('booksList')) return;

  const searchInput = document.getElementById('searchInput');
  const availableOnly = document.getElementById('availableOnly');
  const sortSelect = document.getElementById('sortSelect');
  
  // URL 쿼리 파라미터 처리 (홈에서 넘어온 검색어)
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('q')) searchInput.value = urlParams.get('q');
  if(urlParams.has('sort')) sortSelect.value = urlParams.get('sort');

  const loadBooks = async (reset = false) => {
    if (isFetching || (!hasMoreData && !reset)) return;
    isFetching = true;
    
    if (reset) {
      currentPage = 1;
      hasMoreData = true;
      document.getElementById('booksList').innerHTML = UI.renderBookSkeleton(8);
    } else {
      document.getElementById('loadingTrigger').innerHTML = '<span class="material-symbols-outlined animate-spin text-gray-400">progress_activity</span>';
    }

    try {
      const query = searchInput.value;
      const filter = availableOnly.checked ? 'available' : 'all';
      const sort = sortSelect.value;
      
      const data = await fetchAPI('searchBooks', { query, filter, sort, page: currentPage });
      if(!data) return; // aborted

      hasMoreData = data.hasMore;
      
      const html = data.items.map(book => {
        const isAvail = book['상태'] === '대여가능';
        return `
          <div class="book-card bg-container rounded-xl overflow-hidden shadow-soft flex flex-col">
            <div class="relative w-full aspect-[2/3] bg-surface">
              <img src="${book['표지URL']}" loading="lazy" class="w-full h-full object-cover">
              ${!isAvail ? `<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold backdrop-blur-sm">대여중</div>` : ''}
            </div>
            <div class="p-4 flex flex-col flex-1 gap-1">
              <span class="text-xs text-accent-bg font-bold">${book['카테고리'] || '일반'}</span>
              <h3 class="text-md font-bold line-clamp-1">${book['도서명']}</h3>
              <p class="text-xs text-gray-500 line-clamp-1">${book['저자']} | ${book['출판사']}</p>
              <div class="mt-auto pt-4 flex flex-col gap-2">
                <span class="text-xs bg-surface py-1 px-2 rounded text-gray-600 flex items-center gap-1 w-fit">
                  <span class="material-symbols-outlined text-[14px]">location_on</span>
                  ${UI.formatLocation(book['위치'])}
                </span>
                <button 
                  onclick="rentBook('${book['ISBN']}', '${book['도서명'].replace(/'/g, "\'")}')" 
                  class="w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${isAvail ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
                  ${!isAvail ? 'disabled' : ''}>
                  ${isAvail ? '대여하기' : '대여불가'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const list = document.getElementById('booksList');
      if (reset) list.innerHTML = html;
      else list.insertAdjacentHTML('beforeend', html);
      
      currentPage++;
    } catch (err) {
      if(reset) document.getElementById('booksList').innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">검색 중 오류가 발생했습니다.</div>';
    } finally {
      isFetching = false;
      document.getElementById('loadingTrigger').innerHTML = '';
    }
  };

  const debouncedSearch = Utils.debounce(() => loadBooks(true), 300);

  searchInput.addEventListener('input', debouncedSearch);
  availableOnly.addEventListener('change', () => loadBooks(true));
  sortSelect.addEventListener('change', () => loadBooks(true));

  // Intersection Observer for Infinite Scroll
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadBooks(false);
  }, { rootMargin: '100px' });
  observer.observe(document.getElementById('loadingTrigger'));

  loadBooks(true);
});

window.rentBook = (isbn, title) => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14);
  
  const desc = `<b class="text-primary">${title}</b><br><br>반납예정일: <span class="text-accent-bg font-bold">${Utils.formatDate(dueDate)}</span>`;
  
  UI.showModal('대여하시겠습니까?', desc, '대여', async () => {
    try {
      await fetchAPI('rentBook', { userId: user.id, isbn }, 'POST');
      UI.showToast('대여가 완료되었습니다.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      UI.showModal('대여 불가', err.message, '확인', () => {});
    }
  });
};
