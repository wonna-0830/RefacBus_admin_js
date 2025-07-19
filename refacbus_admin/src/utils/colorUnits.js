// 📁 src/utils/colorUtils.js

const colorPalette = [
  "#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9",
  "#BBDEFB", "#B2EBF2", "#C8E6C9", "#FFF9C4",
  "#FFE0B2", "#D7CCC8",
];

// route 이름을 고유한 색으로 매핑
export const getColorByRoute = (routeName) => {
  if (!routeName) return "#ffffff"; // fallback
  const hash = Array.from(routeName)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorPalette[hash % colorPalette.length];
};
