import React, { useRef, useEffect, useState, useContext } from 'react';
import { Image, Transformer, Group, Rect, Text } from 'react-konva';
import useImage from 'use-image';
import { CanvasContext } from '../context/CanvasContext';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  const { setCropMode } = useContext(CanvasContext);
  const shapeRef = useRef();
  const cropRectRef = useRef();
  const trRef = useRef();
  const [isCropping, setIsCropping] = useState(false);

  // Sticker logic
  const imageSrc = el.type === 'sticker' 
    ? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><text x="250" y="250" font-size="300" font-family="Arial" text-anchor="middle" dominant-baseline="central">${el.text || ''}</text></svg>`)}`
    : el.src || '';

  const [image] = useImage(imageSrc, 'anonymous');

  // Transformer node update
  useEffect(() => {
    if (isSelected && trRef.current) {
      const node = isCropping ? cropRectRef.current : shapeRef.current;
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected, isCropping]);

  // Mobile Selection Handler
  const handleSelect = (e) => {
    if (e) e.cancelBubble = true;
    onSelect(el.id);
  };

  const handleApplyCrop = (e) => {
    if (e) e.cancelBubble = true;
    if (el.tempCrop && image) {
      const scaleX = image.naturalWidth / el.width;
      const scaleY = image.naturalHeight / el.height;
      
      onChange({
        ...el,
        x: el.x + el.tempCrop.x,
        y: el.y + el.tempCrop.y,
        width: el.tempCrop.width,
        height: el.tempCrop.height,
        crop: {
          x: (el.crop?.x || 0) + el.tempCrop.x * scaleX,
          y: (el.crop?.y || 0) + el.tempCrop.y * scaleY,
          width: el.tempCrop.width * scaleX,
          height: el.tempCrop.height * scaleY,
          _applied: true,
        },
        tempCrop: undefined,
      });
    }
    setIsCropping(false);
    setCropMode(false);
  };

  const startCropping = (e) => {
    if (e) e.cancelBubble = true;
    setIsCropping(true);
    setCropMode(true);
    onChange({ ...el, tempCrop: { x: 0, y: 0, width: el.width, height: el.height } });
  };

  const displayCrop = (!isCropping && el.crop?._applied) ? el.crop : undefined;

  return (
    <Group>
      {image && (
        <>
          {isCropping && (
            <Image 
              image={image} x={el.x} y={el.y} width={el.width} height={el.height} 
              opacity={0.3} crop={displayCrop} listening={false} 
              rotation={el.rotation || 0}
            />
          )}

          <Image
            ref={shapeRef}
            image={image}
            x={el.x} y={el.y}
            width={el.width} height={el.height}
            crop={displayCrop}
            draggable={isSelected && !isCropping}
            visible={!isCropping}
            // Mobile and Desktop Selection
            onClick={handleSelect}
            onTap={handleSelect} 
            // Double Tap for Mobile Cropping
            onDblClick={startCropping}
            onDblTap={startCropping} 
            onTransformEnd={() => {
              const node = shapeRef.current;
              onChange({
                ...el,
                x: node.x(), y: node.y(),
                width: Math.max(10, node.width() * node.scaleX()),
                height: Math.max(10, node.height() * node.scaleY()),
                rotation: node.rotation(),
              });
              node.scaleX(1); node.scaleY(1);
            }}
            onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
            rotation={el.rotation || 0}
          />
        </>
      )}

      {isCropping && (
        <Rect
          ref={cropRectRef}
          x={el.x + (el.tempCrop?.x || 0)}
          y={el.y + (el.tempCrop?.y || 0)}
          width={el.tempCrop?.width || el.width}
          height={el.tempCrop?.height || el.height}
          stroke="#fbbf24"
          strokeWidth={3} // Mobile pe thora mota stroke behtar dikhta hai
          draggable
          onDragEnd={(e) => {
            onChange({ ...el, tempCrop: { ...el.tempCrop, x: e.target.x() - el.x, y: e.target.y() - el.y } });
          }}
          onTransformEnd={() => {
            const node = cropRectRef.current;
            onChange({
              ...el,
              tempCrop: {
                x: node.x() - el.x,
                y: node.y() - el.y,
                width: Math.max(10, node.width() * node.scaleX()),
                height: Math.max(10, node.height() * node.scaleY()),
              }
            });
            node.scaleX(1); node.scaleY(1);
          }}
        />
      )}

      {isSelected && (
        <Transformer 
          ref={trRef} 
          rotateEnabled={!isCropping} 
          keepRatio={!isCropping}
          // Mobile Optimization: Resize handlers ko thora bara kar dein
          anchorSize={window.innerWidth < 768 ? 15 : 10}
          borderStroke="#8b5cf6"
          anchorStroke="#8b5cf6"
          anchorFill="white"
          anchorCornerRadius={3}
        />
      )}

      {isCropping && (
        <Group 
          x={el.x + (el.tempCrop?.x || 0)} 
          y={el.y + (el.tempCrop?.y || 0) + (el.tempCrop?.height || el.height) + 10}
          onClick={handleApplyCrop}
          onTap={handleApplyCrop}
        >
          <Rect 
            width={80} height={30} fill="#22c55e" cornerRadius={5} 
            shadowBlur={5} shadowOpacity={0.2}
          />
          <Text 
            width={80} height={30} text="APPLY" fill="white" 
            align="center" verticalAlign="middle" fontSize={12} fontStyle="bold" listening={false} 
          />
        </Group>
      )}
    </Group>
  );
};

export default URLImage;