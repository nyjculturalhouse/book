/**
 * 소소책방 실제 도서 매핑 데이터 (스케치 기준)
 * 열(A~G)별로 1층부터 8층까지 배치된 레이블 텍스트
 */
const BOOKSHELF_DATA = {
  A: ["", "1~4", "4~9", "가~거", "거~고", "고", "", ""],
  B: ["", "고~그", "기~꾸", "나~내", "내~니", "다", "다~도", ""],
  C: ["", "도~듀", "다", "다~뜨", "라~리", "마", "", ""],
  D: ["", "마~무", "무~미", "바~부", "부~비", "사", "사~싶", ""],
  E: ["", "서~세", "세~소", "쇼~쉬", "스~시", "시~쓰", "", ""],
  F: ["", "고~그", "아", "아~어", "에~오", "여~요", "우", ""],
  G: ["", "", "", "", "", "", "", ""] // 비어있는 마지막 우측 책장 대응
};

document.addEventListener('DOMContentLoaded', () => {
  renderBookshelf();
  
  // 예시: 가입/대여 화면 등에서 도서 위치 데이터 'A-04' ('가~거' 칸)를 찾았을 때 작동
  highlightBookLocation('A-04'); 
});

/**
 * 7열 8행의 책장 그리드를 화면에 렌더링하는 함수
 */
function renderBookshelf() {
  const matrixContainer = document.getElementById('bookshelf-matrix');
  if (!matrixContainer) return;
  
  matrixContainer.innerHTML = '';
  
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const totalRows = 8; 
  
  for (let r = 1; r <= totalRows; r++) {
    cols.forEach(c => {
      const cellId = `${c}-0${r}`;
      const shelfText = BOOKSHELF_DATA[c][r - 1] || ''; 
      
      const cellElement = document.createElement('div');
      cellElement.id = `shelf-${cellId}`;
      
      // 공통 스타일에 정의된 --color-border 변수를 사용하여 은은하게 선 처리
      cellElement.className = `
        min-h-[48px] p-1 flex items-center justify-center text-center rounded
        border border-[var(--color-border)] bg-white text-[12px] font-medium text-gray-700
        transition-all duration-300 ease-in-out font-suit shadow-xs break-keep
      `;
      
      cellElement.textContent = shelfText;
      matrixContainer.appendChild(cellElement);
    });
  }
}

/**
 * 도서 위치를 받아서 해당 서가 칸을 집중 하이라이트(세이지 그린) 해주는 함수
 * @param {string} locationCode - 'A-04', 'D-02' 등의 코드
 */
function highlightBookLocation(locationCode) {
  if (!locationCode) return;
  
  // 1. 기존 활성화된 하이라이트 원상복구
  const activeCells = document.querySelectorAll('.active-shelf');
  activeCells.forEach(cell => {
    cell.classList.remove('active-shelf', 'scale-[1.03]', 'shadow-md', 'z-10', 'border-transparent');
    cell.style.backgroundColor = '';
    cell.style.color = '';
    cell.classList.add('bg-white', 'text-gray-700');
  });
  
  // 2. 입력 형식 표준화 (대문자 및 자릿수 맞춤)
  let formattedCode = locationCode.trim().toUpperCase();
  const parts = formattedCode.split('-');
  if (parts.length === 2 && parts[1].length === 1) {
    formattedCode = `${parts[0]}-0${parts[1]}`;
  }
  
  const targetCell = document.getElementById(`shelf-${formattedCode}`);
  
  if (targetCell) {
    // 3. 공통 CSS 변수를 직접 인라인 스타일로 바인딩하여 안전성 극대화
    targetCell.classList.remove('bg-white', 'text-gray-700');
    targetCell.classList.add('active-shelf', 'scale-[1.03]', 'shadow-md', 'z-10', 'border-transparent');
    
    // 브랜드 아이덴티티: 세이지 그린(--color-accent) 배경 & 흰색 글씨 적용
    targetCell.style.backgroundColor = 'var(--color-accent)';
    targetCell.style.color = 'var(--color-accent-text)';
    
    // 안내용 헤더 텍스트 변경
    const labelText = document.getElementById('target-location-text');
    if (labelText) {
      labelText.textContent = `${formattedCode} (${targetCell.textContent || '지정 서가'})`;
    }
  } else {
    console.warn(`이 책장 지도 안에서 '${formattedCode}' 위치는 찾을 수 없습니다.`);
  }
}
