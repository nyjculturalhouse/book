document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));
  if (!user) return;

  const currentContainer = document.getElementById('currentRentals');
  const historyContainer = document.getElementById('historyRentals');
  
  const tabCurrent = document.getElementById('tab-current');
  const tabHistory = document.getElementById('tab-history');

  // Tab Switching
  const switchTab = (active) => {
    if (active === 'current') {
      currentContainer.classList.remove('hidden');
      historyContainer.classList.add('hidden');
      tabCurrent.className = 'pb-3 px-2 font-bold text-accent-bg border-b-2 border-accent-bg transition-colors';
      tabHistory.className = 'pb-3 px-2 font-medium text-gray-500 hover:text-primary transition-colors';
    } else {
      currentContainer.classList.add('hidden');
      historyContainer.classList.remove('hidden');
      tabHistory.className = 'pb-3 px-2 font-bold text-accent-bg border-b-2 border-accent-bg transition-colors';
      tabCurrent.className = 'pb-3 px-2 font-medium text-gray-500 hover:text-primary transition-colors';
    }
  };

  tabCurrent.addEventListener('click', () => switchTab('current'));
  tabHistory.addEventListener('click', () => switchTab('history'));

  // Load Data
  currentContainer.innerHTML = UI.renderBookSkeleton(2);
  
  try {
    const data = await fetchAPI('getRentals', { userId: user.id });
    if (!data) return;

    // Render Current Rentals
    if (data.current.length === 0) {
      currentContainer.innerHTML = '<div class="bg-container rounded-xl p-8 text-center text-gray-500 shadow-soft">현재 대여 중인 도서가 없습니다.</div>';
    } else {
      currentContainer.innerHTML = data.current.map(item => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const dueDate = new Date(item['반납예정일']);
        dueDate.setHours(0,0,0,0);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        let statusBadge = '';
        if (diffDays < 0) {
          statusBadge = `<span class="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">연체 ${Math.abs(diffDays)}일</span>`;
        } else if (diffDays === 0) {
          statusBadge = `<span class="px-2 py-1 bg-accent-bg/10 text-accent-bg rounded text-xs font-bold">오늘 반납</span>`;
        } else {
          statusBadge = `<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">D-${diffDays}</span>`;
        }

        return `
          <div class="bg-container rounded-xl p-4 shadow-soft flex gap-4 items-center slide-up">
            <img src="${item['표지URL']}" class="w-16 h-24 object-cover rounded bg-surface shadow-sm">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-md font-bold truncate">${item['제목']}</h3>
                ${statusBadge}
              </div>
              <p class="text-sm text-gray-500">대여일: ${Utils.formatDate(item['대여일'])}</p>
              <p class="text-sm text-gray-500">반납예정일: ${Utils.formatDate(item['반납예정일'])}</p>
            </div>
            <button onclick="returnBook('${item['ISBN']}', '${item['제목'].replace(/'/g, "\'")}')" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shrink-0">
              반납하기
            </button>
          </div>
        `;
      }).join('');
    }

    // Render History
    if (data.history.length === 0) {
      historyContainer.innerHTML = '<div class="bg-container rounded-xl p-8 text-center text-gray-500 shadow-soft">대여 이력이 없습니다.</div>';
    } else {
      historyContainer.innerHTML = [...data.history].reverse().map(item => {
        const isOverdue = item['연체일수'] > 0;
        return `
          <div class="bg-container rounded-xl p-4 shadow-soft flex flex-col gap-2 slide-up">
            <div class="flex justify-between items-start">
              <h3 class="text-md font-bold text-gray-800">${item['제목']}</h3>
              ${isOverdue ? `<span class="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">연체 (${item['연체일수']}일)</span>` : `<span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">정상반납</span>`}
            </div>
            <div class="flex flex-wrap gap-x-4 text-sm text-gray-500">
              <span>대여: ${Utils.formatDate(item['대여일'])}</span>
              <span>반납: ${Utils.formatDate(item['반납일'])}</span>
            </div>
          </div>
        `;
      }).join('');
    }

  } catch (err) {
    currentContainer.innerHTML = '<div class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</div>';
  }
});

window.returnBook = (isbn, title) => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));
  UI.showModal('반납하시겠습니까?', `<b class="text-primary">${title}</b>`, '반납', async () => {
    try {
      await fetchAPI('returnBook', { userId: user.id, isbn }, 'POST');
      UI.showToast('반납되었습니다.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      UI.showModal('반납 오류', err.message, '확인', () => {});
    }
  });
};
