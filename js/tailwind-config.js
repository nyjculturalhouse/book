/* =========================================================
   소소책방 Tailwind 공통 설정
   - 모든 HTML에 중복 삽입되어 있던 tailwind.config를 여기로 통합
   - 브랜드 컬러(세이지 그린 #4F7C6B 등)를 변경할 때 이 파일 하나만 수정하면 됩니다.
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
        accent: { DEFAULT: "#4F7C6B", bg: "#4F7C6B", text: "#FFFFFF", hover: "#386052" },
        surface: "#F7F6F2",
        container: "#FFFFFF",
        borderColor: "#E5E5E0"
      },
      boxShadow: { soft: "0 8px 30px rgba(0,0,0,0.03)" },
      borderRadius: { xl: "18px" }
    }
  }
};
