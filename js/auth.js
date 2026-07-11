document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('userId').value.trim();
    const pw = document.getElementById('userPw').value.trim();
    const btn = document.getElementById('loginBtn');

    if (!id || !pw) {
      UI.showToast('아이디와 비밀번호를 입력해주세요.', 'error');
      return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';

try {
    // 키 이름을 백엔드 doPost와 정확히 맞춤
    const data = await fetchAPI('login', { id: id, password: pw }, 'POST'); 
    localStorage.setItem('sosoUser', JSON.stringify(data));
    window.location.href = 'index.html';
} catch (err) {
    UI.showToast(err.message || '로그인에 실패했습니다.', 'error');
}
  });
});
