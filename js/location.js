/**
 * 소소책방 실제 도서 매핑 데이터 (스케치 기준)
 * 열(A~F)별로 1층부터 8층까지 배치된 레이블 텍스트 (기존 G열 완전 삭제)
 */
const BOOKSHELF_DATA = {
  A: ["", "1~4", "4~9", "가~거", "거~고", "고", "", ""],
  B: ["", "고~그", "기~꾸", "나~내", "내~니", "다", "다~도", ""],
  C: ["", "도~듀", "다", "다~뜨", "라~리", "마", "", ""],
  D: ["", "마~무", "무~미", "바~부", "부~비", "사", "사~시", ""],
  E: ["", "서~세", "세~소", "쇼~쉬", "스~시", "시~쓰", "", ""],
  F: ["", "고~그", "아", "아~어", "에~오", "여~요", "우", ""]
};

document.addEventListener('DOMContentLoaded', () => {
  renderBookshelf();
});

/**
 * 6열 8행의 책장 그리드를 화면에 렌더링하는 함수
 */
function renderBookshelf() {
  const matrixContainer = document.getElementById('bookshelf-matrix');
  if (!matrixContainer) return;
  
  matrixContainer.innerHTML = '';
  
  const cols = ['A', 'B', 'C', 'D', 'E', 'F']; // 6열 구성
  const totalRows = 8; 
  
  for (let r = 1; r <= totalRows; r++) {
    cols.forEach(c => {
      const cellId = `${c}-0${r}`;
      const shelfText = BOOKSHELF_DATA[c][r - 1] || ''; 
      
      const cellElement = document.createElement('div');
      cellElement.id = `shelf-${cellId}`;
      
      // text-gray-900과 font-semibold을 적용하여 폰트 가독성을 대폭 향상
      cellElement.className = `
        min-h-[48px] p-1 flex items-center justify-center text-center rounded
        border border-[var(--color-border)] bg-white text-[12px] font-semibold text-gray-900
        transition-all duration-300 ease-in-out font-suit shadow-xs break-keep
      `;
      
      cellElement.textContent = shelfText;
      matrixContainer.appendChild(cellElement);
    });
  }
}
