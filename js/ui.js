/* =========================================================
   소소책방 UI 유틸 모듈
   토스트 / 모달 / 스켈레톤 / 위치 포맷 등 공통 UI 컴포넌트
========================================================= */

const UI = {
  /**
   * 토스트 메시지 표시
   * @param {string} message
   * @param {'success'|'error'} type
   */
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    
    // 📌 새로운 브랜드 컬러(Primary Ink Black) 가이드라인 적용을 위해 bg-primary 사용
    const bg = 'bg-primary'; 
    const iconName = type === 'error' ? 'error' : 'check_circle';
    
    // 📌 에러는 기존 레드를 유지, 성공(success) 시 주황색 대신 새로운 브랜드 컬러인 Sage Green(#4F7C6B) 매핑
    const iconColor = type === 'error' ? 'text-red-400' : 'text-[#4F7C6B]';

    // 📌 SUIT 폰트 세부 규칙 (14px, Medium, 자간 -0.015em) 완벽 반영
    toast.className = `toast ${bg} text-white px-5 py-3 rounded-xl shadow-soft flex items-center gap-2 text-[14px] font-medium tracking-[-0.015em] font-suit`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px] ${iconColor}">${iconName}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  },

  /**
   * 확인 모달 표시
   * @param {string} title
   * @param {string} descriptionHtml
   * @param {string} confirmText
   * @param {Function} onConfirm - async 함수 가능
   */
  showModal(title, descriptionHtml, confirmText, onConfirm) {
    const existing = document.getElementById('ui-modal-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'ui-modal-root';
    root.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 modal-backdrop px-4 font-suit';
    
    // 📌 모달 제목(18px Semibold), 본문(14px Light) 스타일 조정
    // 📌 모달 버튼들에 CSS로 추가하신 1번 효과인 쫀득한 팅김 효과 클래스('btn-bounce')를 정밀하게 매핑
    // 📌 확인 버튼에 새로운 세이지 그린 컬러 시스템 적용 (bg-accent / hover 시 Deep Sage로 전환)
    root.innerHTML = `
      <div class="bg-container w-full max-w-[340px] rounded-xl shadow-soft p-6 modal-box text-primary">
        <h3 class="text-[18px] font-semibold mb-2 tracking-[-0.025em]">${title}</h3>
        <div class="text-[14px] font-light text-gray-600 leading-relaxed mb-6 tracking-[-0.015em]">${descriptionHtml}</div>
        <div class="flex gap-2 text-[15px] font-medium tracking-[-0.015em]">
          <button id="ui-modal-cancel" class="btn-bounce flex-1 py-2.5 rounded-lg bg-surface font-medium hover:bg-gray-200 text-primary transition-colors">취소</button>
          <button id="ui-modal-confirm" class="btn-bounce flex-1 py-2.5 rounded-lg bg-accent text-accent-text font-medium hover:bg-[#386052] transition-colors">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const close = () => {
      root.remove();
    };

    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });

    document.getElementById('ui-modal-cancel').addEventListener('click', close);
    document.getElementById('ui-modal-confirm').addEventListener('click', async () => {
      const btn = document.getElementById('ui-modal-confirm');
      btn.disabled = true;
      const original = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>';
      try {
        await onConfirm();
        close();
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  },

  /**
   * 도서 카드 스켈레톤 HTML 반환
   * @param {number} count
   */
  renderBookSkeleton(count = 8) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="bg-container rounded-xl overflow-hidden shadow-soft flex flex-col">
          <div class="w-full aspect-[2/3] skeleton"></div>
          <div class="p-4 flex flex-col gap-2">
            <div class="h-3 w-1/3 skeleton"></div>
            <div class="h-4 w-4/5 skeleton"></div>
            <div class="h-3 w-3/5 skeleton"></div>
            <div class="h-9 w-full skeleton mt-3"></div>
          </div>
        </div>
      `;
    }
    return html;
  },

  /**
   * 위치 코드를 사람이 읽기 쉬운 문자열로 변환
   * 예: "A-03-02" -> "A서가 · 3칸 · 2번째"
   */
  formatLocation(locationCode) {
    if (!locationCode) return '위치 미지정';
    const parts = String(locationCode).split('-');
    if (parts.length < 3) return locationCode;
    const [zone, shelf, order] = parts;
    return `${zone}서가 · ${parseInt(shelf, 10)}칸 · ${parseInt(order, 10)}번째`;
  },

  /**
   * HTML 특수문자 이스케이프 (XSS/구문 오류 방지용)
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * 문자열을 JS 문자열 리터럴(작은따옴표) 안에 안전하게 삽입하기 위한 이스케이프
   * onclick="fn('...')" 형태에 사용 — HTML escape와는 별개로 반드시 필요
   */
  escapeJs(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '\\n');
  }
};
