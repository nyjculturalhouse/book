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
  G: ["", "", "", "", "", "", "", ""] // 스케치 마지막 빈칸 보완용
};

document.addEventListener('DOMContentLoaded', () => {
  // 초기 렌더링 테스트용 (실제 앱에서는 도서 상세 데이터를 받아와 호출)
  renderBookshelf();
  
  // 예시: Books 시트 혹은 도서 정보에서 'A-04' (가~거 서가) 위치가 넘어왔을 때 호출하는 시뮬레이션
  highlightBookLocation('A-04'); 
});

/**
 * 7열 8행의 책장 그리드를 화면에 그리고 스케치 텍스트를 채워 넣는 함수
 */
function renderBookshelf() {
  const matrixContainer = document.getElementById('bookshelf-matrix');
  if (!matrixContainer) return;
  
  matrixContainer.innerHTML = ''; // 초기화
  
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const totalRows = 8; // 위에서부터 1~8층
  
  // 행(Row) 중심으로 루프를 돌며 그리드를 위에서부터 아래로 채움
  for (let r = 1; r <= totalRows; r++) {
    cols.forEach(c => {
      const cellId = `${c}-0${r}`; // 예: A-01, B-03 형식의 고유 ID 부여
      const shelfText = BOOKSHELF_DATA[c][r - 1] || ''; // 데이터 배열은 0부터 시작하므로 r-1
      
      const cellElement = document.createElement('div');
      cellElement.id = `shelf-${cellId}`;
      
      // 실제 사진의 원목 느낌과 스케치의 정갈함을 고려한 테일윈드 스타일 조합
      // 기본적으로 세로 폭을 주기 위해 min-h-[45px] 설정 및 부드러운 애니메이션 효과 부여
      cellElement.className = `
        min-h-[48px] p-1 flex items-center justify-center text-center rounded
        border border-gray-200 bg-white text-[12px] font-medium text-gray-700
        transition-all duration-300 ease-in-out font-suit shadow-xs break-keep
      `;
      
      // 내부에 텍스트가 있으면 배치, 없으면 빈 칸 처리
      cellElement.textContent = shelfText;
      
      matrixContainer.appendChild(cellElement);
    });
  }
}

/**
 * 특정 도서의 위치 코드를 전달받아 해당 칸을 강력하게 하이라이트 해주는 함수
 * @param {string} locationCode - 'A-04', 'D-02' 등의 위치 스트링
 */
function highlightBookLocation(locationCode) {
  if (!locationCode) return;
  
  // 1. 기존에 이미 하이라이트 되어 있던 셀이 있다면 전부 초기화
  const activeCells = document.querySelectorAll('.bg-accent-bg');
  activeCells.forEach(cell => {
    cell.classList.remove('bg-accent-bg', 'text-white', 'scale-[1.03]', 'shadow-md', 'ring-2', 'ring-accent-bg/30', 'z-10');
    cell.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
  });
  
  // 앞뒤 공백 제거 및 대문자 변환 ('a-3' 들어와도 'A-03' 형태로 포맷 정규화 가공)
  let formattedCode = locationCode.trim().toUpperCase();
  
  // 하이픈 분리 검증 및 1자리 층수를 2자리로 보정 (예: A-3 -> A-03)
  const parts = formattedCode.split('-');
  if (parts.length === 2 && parts[1].length === 1) {
    formattedCode = `${parts[0]}-0${parts[1]}`;
  }
  
  // 2. 타겟 서가 칸 엘리먼트 검색
  const targetCell = document.getElementById(`shelf-${formattedCode}`);
  
  if (targetCell) {
    // 3. 소소책방 메인 세이지 그린 컬러 스케일 테마 적용 + 바운스 시각 효과
    targetCell.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
    targetCell.classList.add(
      'bg-accent-bg', 
      'text-white', 
      'scale-[1.03]', 
      'shadow-md', 
      'ring-2', 
      'ring-accent-bg/30',
      'z-10',
      'border-transparent'
    );
    
    // 텍스트 안내 레이블 실시간 업데이트
    const labelText = document.getElementById('target-location-text');
    if (labelText) {
      labelText.textContent = `${formattedCode} (${targetCell.textContent || '지정 서가'})`;
    }
  } else {
    console.warn(`지정된 도서 위치 코드('${formattedCode}')를 책장 맵 내에서 매핑할 수 없습니다.`);
  }
}
