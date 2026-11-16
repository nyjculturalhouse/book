/* =========================================================
   소소책방 Tailwind 공통 설정
   - 모든 HTML에 중복 삽입되어 있던 tailwind.config를 여기로 통합
   - 브랜드 컬러(세이지 그린 #0b50d0 등)를 변경할 때 이 파일 하나만 수정하면 됩니다.
   - 반드시 Tailwind CDN 스크립트(cdn.tailwindcss.com) "다음"에 로드되어야 합니다.
========================================================= */

tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        suit: ['Suit', 'sans-serif'],
        haeong: ['KookminUniversityHaeongSans', 'sans-serif']
      },
      colors: {
        primary: { DEFAULT: "#1C1C1E", hover: "#38383A" },
        accent: { DEFAULT: "#0b50d0", bg: "#0b50d0", text: "#FFFFFF", hover: "#083e9e" },
        surface: "#f4f5f6",
        container: "#FFFFFF",
        borderColor: "#d7dce1"
      },
      boxShadow: { soft: "0 8px 30px rgba(0,0,0,0.03)" },
      borderRadius: { xl: "12px" }
    }
  }
};
