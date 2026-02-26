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

  const imageSrc = el.type === 'sticker' 
    ? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><text x="250" y="250" font-size="300" font-family="Arial" text-anchor="middle" dominant-baseline="central">${el.text || ''}</text></svg>`)}`
    : el.src || '';

  const [image] = useImage(imageSrc, 'anonymous');

  useEffect(() => {
    if (image && !isSelected && !el.crop) {
      onSelect(el.id);
    }
  }, [image]);

  useEffect(() => {
    if (isSelected && trRef.current) {
      const node = isCropping ? cropRectRef.current : shapeRef.current;
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected, isCropping]);

  useEffect(() => {
    if (!isSelected && isCropping) {
      setIsCropping(false);
      setCropMode(false);
    }
  }, [isSelected]);

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
    onSelect(null); 
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    onChange({
      ...el,
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * node.scaleX()),
      height: Math.max(10, node.height() * node.scaleY()),
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  const displayCrop = (!isCropping && el.crop?._applied) ? el.crop : undefined;

  return (
    <Group>
      {image && (
        <>
          {isCropping && (
            <Image 
              image={image} x={el.x} y={el.y} width={el.width} height={el.height} 
              opacity={0.2} crop={displayCrop} listening={false} 
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
            onMouseDown={(e) => {
              e.cancelBubble = true;
              onSelect(el.id);
            }}
            onDblClick={(e) => {
              e.cancelBubble = true;
              setIsCropping(true);
              setCropMode(true);
              onChange({ ...el, tempCrop: { x: 0, y: 0, width: el.width, height: el.height } });
            }}
            onTransformEnd={handleTransformEnd}
            onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
            rotation={el.rotation || 0}
          />

          {isCropping && el.tempCrop && (
            <Image
              image={image}
              x={el.x + el.tempCrop.x}
              y={el.y + el.tempCrop.y}
              width={el.tempCrop.width}
              height={el.tempCrop.height}
              listening={false}
              crop={{
                x: (el.crop?.x || 0) + el.tempCrop.x * (image.naturalWidth / el.width),
                y: (el.crop?.y || 0) + el.tempCrop.y * (image.naturalHeight / el.height),
                width: el.tempCrop.width * (image.naturalWidth / el.width),
                height: el.tempCrop.height * (image.naturalHeight / el.height),
              }}
            />
          )}
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
          strokeWidth={2}
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
        />
      )}

      
      {isCropping && (
        <Group x={el.x + (el.tempCrop?.x || 0)} y={el.y + (el.tempCrop?.y || 0) + (el.tempCrop?.height || el.height) + 5}>
          <Rect 
            width={60} height={22} fill="#22c55e" cornerRadius={3} 
            onClick={handleApplyCrop} 
            onMouseDown={(e) => e.cancelBubble = true} 
          />
          <Text 
            width={60} height={22} text="APPLY" fill="white" 
            align="center" verticalAlign="middle" fontSize={10} fontStyle="bold" listening={false} 
          />
        </Group>
      )}
    </Group>
  );
};

export default URLImage;