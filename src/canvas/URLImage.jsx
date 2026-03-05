import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Group, Rect, Text } from 'react-konva';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const [imageObj, setImageObj] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (!el?.src) {
      setImageError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setImageError(false);

    const img = new window.Image();
    if (typeof el.src === 'string' && el.src.startsWith('http')) {
      img.crossOrigin = "anonymous";
    }

    img.src = el.src;

    img.onload = () => {
      setImageObj(img);
      setIsLoading(false);
      
      if (!el.crop || el.crop.width === 0) {
        onChange({
          ...el,
          originalWidth: img.width,
          originalHeight: img.height,
          crop: { x: 0, y: 0, width: img.width, height: img.height },
        });
      }
    };

    img.onerror = (err) => {
      console.error("❌ Image Load Failed:", el.src, err);
      setImageError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [el?.src]);

  const handleDoubleClick = (e) => {
    if (el.isFixed) return;
    e.cancelBubble = true;
    setIsCropping(!isCropping);
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(20, node.width() * scaleX);
    const newHeight = Math.max(20, node.height() * scaleY);

    if (isCropping) {
      const dx = node.x() - el.x;
      const dy = node.y() - el.y;

    
      const cropX = el.crop.x + (dx * (el.crop.width / el.width));
      const cropY = el.crop.y + (dy * (el.crop.height / el.height));
      
      const cropWidth = el.crop.width * scaleX;
      const cropHeight = el.crop.height * scaleY;

      onChange({
        ...el,
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
        crop: {
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight,
        }
      });
    } else {
      
      onChange({
        ...el,
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
        rotation: node.rotation(),
      });
    }
  };

  const handleDragEnd = (e) => {
    onChange({ ...el, x: e.target.x(), y: e.target.y() });
  };

  const applyCrop = (e) => {
    if (e) e.cancelBubble = true;
    setIsCropping(false);
  };

  if (isLoading) return <Group x={el.x} y={el.y}><Rect width={el.width} height={el.height} fill="#f1f5f9" /></Group>;
  if (imageError || !imageObj) return <Group x={el.x} y={el.y}><Rect width={el.width} height={el.height} fill="#fef2f2" /></Group>;

  return (
    <Group>
      <KonvaImage
        id={el.id}
        ref={shapeRef}
        image={imageObj}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        crop={el.crop}
        rotation={el.rotation || 0}
        draggable={!el.isFixed && !isCropping}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleDragEnd}
      />

      {isCropping && (
        <Group>
          <KonvaImage 
            image={imageObj} 
            x={el.x} y={el.y} 
            width={el.width} height={el.height} 
            opacity={0.2} listening={false} 
          />
          <Rect 
            x={el.x} y={el.y} 
            width={el.width} height={el.height} 
            stroke="#f59e0b" strokeWidth={2} dash={[4, 4]} 
            listening={false} 
          />
          <Group x={el.x + el.width/2 - 40} y={el.y + el.height + 10} onClick={applyCrop} onTap={applyCrop}>
            <Rect width={80} height={25} fill="#f59e0b" cornerRadius={5} />
            <Text width={80} height={25} text="Done" fill="white" align="center" verticalAlign="middle" fontStyle="bold" />
          </Group>
        </Group>
      )}
    </Group>
  );
};

export default URLImage;