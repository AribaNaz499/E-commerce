import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Transformer, Group, Rect, Text } from 'react-konva';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isCropping, setIsCropping] = useState(false);
  const [cropPreview, setCropPreview] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!el?.src) {
      setImageError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setImageError(false);
    
    const img = new window.Image();
    img.crossOrigin = "anonymous";
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
      console.error("Failed to load image:", el.src, err);
      setImageError(true);
      setIsLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [el?.src]);

  const handleDoubleClick = (e) => {
    e.cancelBubble = true;
    setIsCropping(true);
  };

  const handleTransform = () => {
    if (isCropping) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      setCropPreview({
        x: node.x(),
        y: node.y(),
        width: node.width() * scaleX,
        height: node.height() * scaleY,
      });
    }
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);

    if (isCropping) {
      const newWidth = node.width() * scaleX;
      const newHeight = node.height() * scaleY;
      const cropX = el.crop.x + ((node.x() - el.x) * (el.crop.width / el.width));
      const cropY = el.crop.y + ((node.y() - el.y) * (el.crop.height / el.height));
      
      onChange({
        ...el,
        crop: {
          x: Math.max(0, Math.min(el.originalWidth - el.crop.width, cropX)),
          y: Math.max(0, Math.min(el.originalHeight - el.crop.height, cropY)),
          width: el.crop.width * (newWidth / el.width),
          height: el.crop.height * (newHeight / el.height),
        },
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
      });
      setCropPreview(null);
    } else {
      onChange({
        ...el,
        x: node.x(),
        y: node.y(),
        width: Math.max(20, node.width() * scaleX),
        height: Math.max(20, node.height() * scaleY),
        rotation: node.rotation(),
      });
    }
  };

  const handleDragEnd = (e) => {
    if (!isCropping) {
      onChange({ ...el, x: e.target.x(), y: e.target.y() });
    }
  };

  const applyCrop = (e) => {
    e.cancelBubble = true;
    setIsCropping(false);
    setCropPreview(null);
  };

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isCropping) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isCropping]);

  if (isLoading) {
    return (
      <Group>
        <Rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#f3f4f6" stroke="#9ca3af" strokeWidth={1} dash={[5, 5]} cornerRadius={4} />
        <Text x={el.x + 10} y={el.y + el.height/2 - 10} text="Loading..." fontSize={12} fill="#6b7280" />
      </Group>
    );
  }

  if (imageError || !imageObj) {
    return (
      <Group>
        <Rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#fee2e2" stroke="#ef4444" strokeWidth={2} dash={[5, 5]} cornerRadius={4} />
        <Text x={el.x + 10} y={el.y + el.height/2 - 10} text="Image Error" fontSize={12} fill="#ef4444" fontStyle="bold" />
      </Group>
    );
  }

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
        draggable={!isCropping}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleDragEnd}
        rotation={el.rotation || 0}
      />
      {isCropping && (
        <Group>
          <KonvaImage image={imageObj} x={el.x} y={el.y} width={el.width} height={el.height} opacity={0.3} listening={false} />
          <Rect x={el.x} y={el.y} width={el.width} height={el.height} fill="transparent" stroke="#fbbf24" strokeWidth={3} dash={[5, 5]} listening={false} />
          {cropPreview && (
            <Rect x={cropPreview.x} y={cropPreview.y} width={cropPreview.width} height={cropPreview.height} fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth={3} listening={false} />
          )}
          <Text x={el.x} y={el.y - 35} text="✂️ CROP MODE" fontSize={14} fill="#fbbf24" fontStyle="bold" listening={false} />
          <Group x={el.x + el.width/2 - 70} y={el.y + el.height + 20} onClick={applyCrop} onTap={applyCrop}>
            <Rect width={140} height={40} fill="#fbbf24" cornerRadius={20} />
            <Text width={140} height={40} text="✓ APPLY CROP" fill="black" align="center" verticalAlign="middle" fontStyle="bold" />
          </Group>
        </Group>
      )}
    </Group>
  );
};

export default URLImage;