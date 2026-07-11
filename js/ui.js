// js/ui.js
export const createBookCard = (book) => {
  // book = [ISBN, 도서명, 카테고리, 저자, 출판사, 상태, 위치, 등록일, 표지URL]
  const [isbn, title, cat, author, pub, status, loc, date, cover] = book;
  
  return `
    <div class="bg-container p-4 rounded-xl shadow-soft hover:scale-[1.02] transition-all duration-300">
      <img src="${cover}" alt="${title}" class="w-full h-48 object-cover rounded-lg mb-4" loading="lazy">
      <h3 class="font-bold text-lg truncate">${title}</h3>
      <p class="text-sm text-gray-500 mb-2">${author} · ${pub}</p>
      <div class="flex justify-between items-center mt-4">
        <span class="text-xs px-2 py-1 bg-surface rounded-md">${loc}</span>
        <button class="${status === '대여가능' ? 'bg-accent-bg text-accent-text' : 'bg-gray-200'} px-4 py-2 rounded-lg text-sm font-semibold">
          ${status}
        </button>
      </div>
    </div>
  `;
};
