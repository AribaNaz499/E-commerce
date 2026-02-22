export default function useCanvasScale(
  windowWidth,
  orientation,
  activeTool
) {
  const topGap = windowWidth < 768 ? 80 : 120;
  const availableHeight = window.innerHeight - topGap;
  const sidebarWidth = activeTool ? (windowWidth < 768 ? 0 : 320) : 80;
  const availableWidth = windowWidth - sidebarWidth - 40;

  const baseWidth = orientation === "portrait" ? 450 : 600;
  const baseHeight = orientation === "portrait" ? 600 : 450;

  const scaleW = availableWidth / baseWidth;
  const scaleH = availableHeight / baseHeight;

  if (windowWidth < 768) return Math.min(scaleW, 0.85);
  return Math.min(scaleW, scaleH, 0.95);
}
