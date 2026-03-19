import { useState, useCallback } from 'react';

const SNAP_THRESHOLD = 8;

export const useSnapping = (elements) => {
  const [guidelines, setGuidelines] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const getSnapLines = useCallback((draggedEl) => {
    const lines = { vertical: [], horizontal: [] };

    elements.forEach(el => {
      if (el.id === draggedEl.id) return;
      const w = el.width || 100;
      const h = el.height || 50;

      lines.vertical.push(el.x);
      lines.vertical.push(el.x + w / 2);
      lines.vertical.push(el.x + w);

      lines.horizontal.push(el.y);
      lines.horizontal.push(el.y + h / 2);
      lines.horizontal.push(el.y + h);
    });

    lines.vertical.push(200);  
    lines.horizontal.push(275); 

    return lines;
  }, [elements]);

  const snapPosition = useCallback((draggedEl, newX, newY) => {
    
    if (!isDragging) return { x: newX, y: newY };

    const snapLines = getSnapLines(draggedEl);
    const w = draggedEl.width || 100;
    const h = draggedEl.height || 50;

    let snappedX = newX;
    let snappedY = newY;
    const activeGuides = [];

    const xPoints = [
      { val: newX,         offset: 0     },  
      { val: newX + w / 2, offset: w / 2 }, 
      { val: newX + w,     offset: w     },  
    ];

    for (const vLine of snapLines.vertical) {
      for (const point of xPoints) {
        if (Math.abs(point.val - vLine) < SNAP_THRESHOLD) {
          snappedX = vLine - point.offset;
          activeGuides.push({ type: 'vertical', pos: vLine });
          break;
        }
      }
      if (activeGuides.some(g => g.type === 'vertical')) break;
    }

    const yPoints = [
      { val: newY,         offset: 0     },  
      { val: newY + h / 2, offset: h / 2 },  
      { val: newY + h,     offset: h     },  
    ];

    for (const hLine of snapLines.horizontal) {
      for (const point of yPoints) {
        if (Math.abs(point.val - hLine) < SNAP_THRESHOLD) {
          snappedY = hLine - point.offset;
          activeGuides.push({ type: 'horizontal', pos: hLine });
          break;
        }
      }
      if (activeGuides.some(g => g.type === 'horizontal')) break;
    }

    setGuidelines(activeGuides);
    return { x: snappedX, y: snappedY };
  }, [getSnapLines, isDragging]);

  const startDragging = useCallback(() => {
    setIsDragging(true);
  }, []);

  const clearGuidelines = useCallback(() => {
    setIsDragging(false);  
    setGuidelines([]);     
  }, []);

  return { snapPosition, guidelines, clearGuidelines, startDragging };
};