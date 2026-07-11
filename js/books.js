// js/books.js
import { callAPI } from './api.js';

let currentPage = 1;
let isLoading = false;

export const loadBooks = async (query = '', isNewSearch = false) => {
  if (isLoading) return;
  if (isNewSearch) {
    currentPage = 1;
    document.getElementById('book-list').innerHTML = '';
  }
  
  isLoading = true;
  const result = await callAPI('getBooks', { page: currentPage, query });
  
  // 데이터 렌더링 (Skeleton 제거 후 카드 추가)
  renderBooks(result.items);
  
  isLoading = false;
  currentPage++;
};

// Intersection Observer 설정 (스크롤 감지)
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !isLoading) {
    loadBooks();
  }
}, { threshold: 1.0 });

// 마지막 요소 감지하여 observer 연결
// observer.observe(document.querySelector('#sentinel'));
