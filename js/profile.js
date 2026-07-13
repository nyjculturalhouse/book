/* =========================================================
   내정보 페이지 전용 스크립트
   - 프로필 조회
   - 회원탈퇴 (비밀번호 확인 필요)
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('sosoUser'));
  if (!user) return;

  const container = document.getElementById('profileContainer');

  // 전화번호 포맷 (01039413445 → 010-3941-3445)
  function formatPhone(phone) {
    const num = String(phone || '').replace(/\D/g, '');

    if (num.length === 11) {
      return num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    if (num.length === 10) {
      return num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone || '';
  }

  try {
    const data = await fetchAPI('getUserProfile', { userId: user.id });
    if (!data) return;

    container.innerHTML = `
      <div class="space-y-6 slide-up">
        <div class="flex flex-col gap-1 border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400">이름</span>
          <span class="text-lg font-medium">${UI.escapeHtml(data['이름'])}</span>
        </div>

        <div class="flex flex-col gap-1 border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400">아이디 (사번)</span>
          <span class="text-lg font-medium">${UI.escapeHtml(data['아이디'])}</span>
        </div>

        <div class="flex flex-col gap-1 border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400">전화번호</span>
          <span class="text-lg font-medium">${formatPhone(data['전화번호'])}</span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-gray-400">가입일</span>
          <span class="text-lg font-medium">${Utils.formatDate(data['생성일'])}</span>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="text-center text-red-500">${err.message || '정보를 불러오는데 실패했습니다.'}</div>`;
  }

  // 회원탈퇴 로직
  const withdrawBtn = document.getElementById('withdrawBtn');
  withdrawBtn.addEventListener('click', () => {
    const modalHtml = `
      <div id="pw-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 fade-in px-4">
        <div class="bg-container w-full max-w-[320px] rounded-xl shadow-soft p-6 slide-up">
          <h3 class="text-lg font-bold mb-2 text-red-500">회원탈퇴</h3>
          <p class="text-sm text-gray-600 mb-4">탈퇴를 위해 비밀번호를 입력해주세요.</p>

          <input
            type="password"
            id="withdrawPw"
            class="w-full h-10 px-3 border border-gray-300 rounded mb-6 outline-none focus:border-red-500"
            placeholder="비밀번호">

          <div class="flex gap-2">
            <button id="pw-cancel" class="flex-1 py-2.5 rounded-lg bg-gray-100 font-medium hover:bg-gray-200 transition">
              취소
            </button>

            <button id="pw-confirm" class="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition">
              탈퇴
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('pw-cancel').onclick = () => {
      document.getElementById('pw-modal').remove();
    };

    document.getElementById('pw-confirm').onclick = async () => {
      const pw = document.getElementById('withdrawPw').value.trim();

      if (!pw) {
        UI.showToast('비밀번호를 입력해주세요.', 'error');
        return;
      }

      const btn = document.getElementById('pw-confirm');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>';

      try {
        await fetchAPI('deleteUser', {
          userId: user.id,
          password: pw
        }, 'POST');

        invalidateFetchCache();

        UI.showToast('탈퇴가 완료되었습니다.');

        localStorage.removeItem('sosoUser');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);

      } catch (err) {
        UI.showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerText = '탈퇴';
      }
    };
  });
});
