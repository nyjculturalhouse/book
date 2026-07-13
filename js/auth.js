/* =========================================================
   로그인 / 회원가입 페이지 전용 스크립트
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return; // login.html이 아니면 종료

  const signupForm = document.getElementById('signupForm');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const signupPhoneInput = document.getElementById('signupPhone');

  // ---------- 로그인 / 회원가입 탭 전환 ----------
  const showLogin = () => {
    loginForm.classList.remove('hidden');
    loginForm.classList.add('flex');
    signupForm.classList.add('hidden');
    signupForm.classList.remove('flex');
    tabLogin.className = 'flex-1 h-10 rounded-md text-sm font-bold bg-container shadow-soft transition-colors';
    tabSignup.className = 'flex-1 h-10 rounded-md text-sm font-bold text-gray-400 transition-colors';
  };

  const showSignup = () => {
    signupForm.classList.remove('hidden');
    signupForm.classList.add('flex');
    loginForm.classList.add('hidden');
    loginForm.classList.remove('flex');
    tabSignup.className = 'flex-1 h-10 rounded-md text-sm font-bold bg-container shadow-soft transition-colors';
    tabLogin.className = 'flex-1 h-10 rounded-md text-sm font-bold text-gray-400 transition-colors';
  };

  tabLogin.addEventListener('click', showLogin);
  tabSignup.addEventListener('click', showSignup);

  // 📌 ---------- 회원가입 창 입력 시 하이픈(-) 자동 포맷팅 ----------
  if (signupPhoneInput) {
    signupPhoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // 숫자만 남기기
      
      if (value.length <= 3) {
        e.target.value = value;
      } else if (value.length <= 7) {
        e.target.value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
      } else {
        e.target.value = value.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
      }
    });
  }

  // ---------- 로그인 ----------
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
      const data = await fetchAPI('login', { id, password: pw }, 'POST');
      if (!data) return; // 취소된 요청
      localStorage.setItem('sosoUser', JSON.stringify(data));
      window.location.href = 'index.html';
    } catch (err) {
      UI.showToast(err.message || '로그인에 실패했습니다.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });

  // ---------- 회원가입 ----------
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('signupId').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const btn = document.getElementById('signupBtn');

    if (!id || !name || !phone) {
      UI.showToast('모든 항목을 입력해주세요.', 'error');
      return;
    }

    // 숫자가 아닌 대시(-)나 공백을 완전히 걷어내어 오직 숫자 데이터만 추출
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      UI.showToast('올바른 전화번호를 입력해주세요.', 'error');
      return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';

    try {
      // 가입 요청을 보낼 때는 순수 숫자 형태로 가공된 변수(phoneDigits)를 전송
      await fetchAPI('signup', { id, name, phone: phoneDigits }, 'POST');
      UI.showToast('회원가입이 완료되었습니다. 로그인해주세요.');
      document.getElementById('signupForm').reset();
      showLogin();
      document.getElementById('userId').value = id;
    } catch (err) {
      UI.showToast(err.message || '회원가입에 실패했습니다.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
});
