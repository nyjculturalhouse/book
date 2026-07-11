// tailwind config injection
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#111111", hover: "#222222" },
        accent: { bg: "#FF5A36", text: "#FFFFFF", hover: "#E04825" },
        surface: "#F4F4F3",
        container: "#FFFFFF",
        onSurface: "#111111"
      },
      boxShadow: { soft: "0 8px 30px rgba(0,0,0,0.03)" },
      borderRadius: { xl: "18px" }
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // 인증 체크
  const user = JSON.parse(localStorage.getItem('sosoUser') || 'null');
  if (!user && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
    return;
  }

  // 로그아웃 이벤트 바인딩
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('sosoUser');
      window.location.href = 'login.html';
    };
  }

  // 홈 화면 데이터 로드
  if (document.getElementById('newBooksContainer')) {
    await loadHomeData();
    
    document.getElementById('homeSearchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('homeSearchInput').value;
      window.location.href = `books.html?q=${encodeURIComponent(q)}`;
    });
  }
});

async function loadHomeData() {
  const newContainer = document.getElementById('newBooksContainer');
  const popContainer = document.getElementById('popularBooksContainer');
  
  newContainer.innerHTML = UI.renderBookSkeleton(8);
  popContainer.innerHTML = UI.renderBookSkeleton(5);

  try {
    const data = await fetchAPI('getHomeData');
    if(!data) return; // aborted

    newContainer.innerHTML = data.newBooks.map(renderMiniBookCard).join('');
    popContainer.innerHTML = data.popularBooks.map(renderMiniBookCard).join('');
  } catch (e) {
    UI.showToast('데이터를 불러오는데 실패했습니다.', 'error');
  }
}

function renderMiniBookCard(book) {
  return `
    <a href="books.html?q=${book['ISBN']}" class="book-card bg-container rounded-xl p-3 flex flex-col gap-2 cursor-pointer">
      <div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-surface">
        <img src="${book['표지URL']}" loading="lazy" class="w-full h-full object-cover" alt="표지">
      </div>
      <div class="mt-1">
        <h3 class="text-sm font-bold line-clamp-1">${book['도서명']}</h3>
        <p class="text-xs text-gray-500 line-clamp-1">${book['저자']}</p>
      </div>
    </a>
  `;
}
