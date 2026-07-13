/* =========================================================
   공통 유틸리티 함수
========================================================= */

const Utils = {
  /**
   * 연속 호출을 제한하는 디바운스 함수 (검색 입력 등에 사용)
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 날짜 문자열/Date 객체를 YYYY. MM. DD 형식으로 깔끔하게 변환
   * (기존 대시(-) 포맷을 점(.)과 공백으로 변경하여 정돈된 인상을 줍니다)
   */
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  }
};
