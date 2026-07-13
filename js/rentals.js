/* =========================================================
   대여현황 페이지 전용 스크립트
   - 현재 대여 / 대여 이력 탭 전환
   - 반납 처리
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));
  if (!user) return;

  const currentContainer = document.getElementById('currentRentals');
  const historyContainer = document.getElementById('historyRentals');

  const tabCurrent = document.getElementById('tab-current');
  const tabHistory = document.getElementById('tab-history');

  // 탭 전환
  const switchTab = (active) => {
    if (active === 'current') {
      currentContainer.classList.remove('hidden');
      historyContainer.classList.add('hidden');
      tabCurrent.className = 'pb-3 px-2 font-suit text-[16px] font-semibold text-accent-bg border-b-2 border-accent-bg transition-colors tracking-[-0.02em]';
      tabHistory.className = 'pb-3 px-2 font-suit text-[16px] font-medium text-gray-500 hover:text-primary transition-colors tracking-[-0.02em]';
    } else {
      currentContainer.classList.add('hidden');
      historyContainer.classList.remove('hidden');
      tabHistory.className = 'pb-3 px-2 font-suit text-[16px] font-semibold text-accent-bg border-b-2 border-accent-bg transition-colors tracking-[-0.02em]';
      tabCurrent.className = 'pb-3 px-2 font-suit text-[16px] font-medium text-gray-500 hover:text-primary transition-colors tracking-[-0.02em]';
    }
  };

  tabCurrent.addEventListener('click', () => switchTab('current'));
  tabHistory.addEventListener('click', () => switchTab('history'));

  // 데이터 로드
  currentContainer.innerHTML = UI.renderBookSkeleton(2);

  try {
    const data = await fetchAPI('getRentals', { userId: user.id });
    if (!data) return;

    // 현재 대여
    if (data.current.length === 0) {
      currentContainer.innerHTML = '<div class="bg-container rounded-xl p-8 text-center text-gray-500 shadow-soft font-suit text-[15px] font-normal tracking-[-0.015em]">현재 대여 중인 도서가 없습니다.</div>';
    } else {
      currentContainer.innerHTML = data.current.map(renderCurrentItem).join('');
    }

    // 대여 이력
    if (data.history.length === 0) {
      historyContainer.innerHTML = '<div class="bg-container rounded-xl p-8 text-center text-gray-500 shadow-soft font-suit text-[15px] font-normal tracking-[-0.015em]">대여 이력이 없습니다.</div>';
    } else {
      historyContainer.innerHTML = [...data.history].reverse().map(renderHistoryItem).join('');
    }
  } catch (err) {
    currentContainer.innerHTML = `<div class="text-center text-red-500 py-8 font-suit text-[15px] font-normal tracking-[-0.015em]">${err.message || '데이터를 불러오는데 실패했습니다.'}</div>`;
  }
});

function renderCurrentItem(item) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(item['반납예정일']);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  let statusBadge = '';
  if (diffDays < 0) {
    statusBadge = `<span class="px-2 py-1 bg-red-100 text-red-600 rounded text-[14px] font-suit font-semibold tracking-[-0.01em]">연체 ${Math.abs(diffDays)}일</span>`;
  } else if (diffDays === 0) {
    statusBadge = `<span class="px-2 py-1 bg-accent-bg/10 text-accent-bg rounded text-[14px] font-suit font-semibold tracking-[-0.01em]">오늘 반납</span>`;
  } else {
    statusBadge = `<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[14px] font-suit font-semibold tracking-[-0.01em]">D-${diffDays}</span>`;
  }

  const safeIsbnForJs = UI.escapeJs(item['ISBN']);
  const safeTitleForJs = UI.escapeJs(item['제목']);

  // 📌 반납하기 버튼의 class에 'btn-bounce'를 추가하여 쫀득한 튕김 인터랙션 매핑
  return `
    <div class="bg-container rounded-xl p-4 shadow-soft flex gap-4 items-center slide-up">
      <img src="${item['표지URL']}" class="w-16 h-24 object-cover rounded bg-surface shadow-sm">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-suit text-[17px] font-medium tracking-[-0.02em] truncate">${UI.escapeHtml(item['제목'])}</h3>
          ${statusBadge}
        </div>
        <p class="font-suit text-[14px] font-light tracking-[-0.01em] text-gray-500">대여일: ${Utils.formatDate(item['대여일'])}</p>
        <p class="font-suit text-[14px] font-light tracking-[-0.01em] text-gray-500">반납예정일: ${Utils.formatDate(item['반납예정일'])}</p>
      </div>
      <button onclick="returnBook('${safeIsbnForJs}', '${safeTitleForJs}')" class="btn-bounce px-4 py-2 bg-primary text-white rounded-lg font-suit text-[15px] font-normal tracking-[-0.015em] hover:bg-primary-hover transition-colors shrink-0">
        반납하기
      </button>
    </div>
  `;
}

// 대여 이력 렌더링 (단순 상태 표시 영역이므로 별도의 버튼 인터랙션 클래스는 불필요하여 디자인 유지)
function renderHistoryItem(item) {
  const isOverdue = item['연체일수'] > 0;
  return `
    <div class="bg-container rounded-xl p-4 shadow-soft flex gap-4 items-center slide-up">
      <img src="${item['표지URL']}" class="w-16 h-24 object-cover rounded bg-surface shadow-sm">
      <div class="flex-1 min-w-0">
        <h3 class="font-suit text-[17px] font-medium tracking-[-0.02em] text-gray-800 mb-1 truncate">${UI.escapeHtml(item['제목'])}</h3>
        <div class="flex flex-col gap-0.5 font-suit text-[14px] font-light tracking-[-0.01em] text-gray-500">
          <span>대여: ${Utils.formatDate(item['대여일'])}</span>
          <span>반납: ${Utils.formatDate(item['반납일'])}</span>
        </div>
      </div>
      <div class="shrink-0">
        ${isOverdue
          ? `<span class="inline-block px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-lg font-suit text-[15px] font-semibold tracking-[-0.015em] text-center min-w-[80px]">연체 ${item['연체일수']}일</span>`
          : `<span class="inline-block px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-lg font-suit text-[15px] font-semibold tracking-[-0.015em] text-center min-w-[80px]">정상반납</span>`}
      </div>
    </div>
  `;
}

window.returnBook = (isbn, title) => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));
  UI.showModal('반납하시겠습니까?', `<b class="text-primary">${UI.escapeHtml(title)}</b>`, '반납', async () => {
    try {
      await fetchAPI('returnBook', { userId: user.id, isbn }, 'POST');
      invalidateFetchCache();
      UI.showToast('반납되었습니다.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      UI.showToast(err.message, 'error');
      throw err;
    }
  });
};
