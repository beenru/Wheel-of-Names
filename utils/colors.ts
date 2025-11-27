// Christmas Palette
const CHRISTMAS_COLORS = [
  '#b91c1c', // Red 700
  '#15803d', // Green 700
  '#b45309', // Amber 700 (Gold/Bronze)
  '#991b1b', // Red 800
  '#166534', // Green 800
  '#a16207', // Yellow 700
  '#7f1d1d', // Red 900
  '#14532d', // Green 900
];

export const getSegmentColor = (index: number, total: number): string => {
  // Use simple modulo for the Christmas palette to ensure alternating colors
  return CHRISTMAS_COLORS[index % CHRISTMAS_COLORS.length];
};