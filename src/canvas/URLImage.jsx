import React, { useRef, useEffect, useState, useContext } from 'react';
import { Image, Transformer, Group, Rect, Text } from 'react-konva';
import useImage from 'use-image';
import { CanvasContext } from '../context/CanvasContext';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  const { setCropMode, activeTool } = useContext(CanvasContext);

  const shapeRef = useRef();
  const trRef = useRef();
  const [isCropping, setIsCropping] = useState(false);

  
  const imageSrc = el.type === 'sticker'
    ? `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
          <text x="250" y="250" font-size="300" font-family="Arial" text-anchor="middle" dominant-baseline="central">${el.text || ''}</text>
        </svg>`)}`
    : el.src || '';

  
  const [image] = useImage(imageSrc, 'anonymous');

  // Sync Crop Mode
  useEffect(() => {
    if (isSelected && activeTool === 'crop') {
      setIsCropping(true);
      setCropMode(true);
    } else {
      setIsCropping(false);
      setCropMode(false);
    }
  }, [activeTool, isSelected, setCropMode]);

  
  useEffect(() => {
    if (image && !el.crop) {
      onChange({
        ...el,
        crop: { x: 0, y: 0, width: image.width, height: image.height }
      });
    }
  }, [image]);

  
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isCropping]);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    if (isCropping) {
      const newCrop = {
        x: (el.crop?.x || 0) + (node.x() - el.x) * ((el.crop?.width || el.width) / el.width),
        y: (el.crop?.y || 0) + (node.y() - el.y) * ((el.crop?.height || el.height) / el.height),
        width: Math.max(10, (el.crop?.width || el.width) * scaleX),
        height: Math.max(10, (el.crop?.height || el.height) * scaleY),
      };

      onChange({
        ...el,
        crop: newCrop,
        x: node.x(),
        y: node.y(),
      });
    } else {
      const newWidth = Math.max(10, node.width() * scaleX);
      const newHeight = Math.max(10, node.height() * scaleY);

      onChange({
        ...el,
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
        rotation: node.rotation() || 0,
      });
    }
  };

  const handleDragEnd = (e) => {
    onChange({ 
      ...el, 
      x: e.target.x(), 
      y: e.target.y() 
    });
  };

  const handleDoubleClick = (e) => {
    e.cancelBubble = true;
    setIsCropping(!isCropping);
    setCropMode(!isCropping);
  };

  const handleApplyCrop = () => {
    setIsCropping(false);
    setCropMode(false);
  };

  return (
    <Group>
    
      {isCropping && image && (
        <Image
          image={image}
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          opacity={0.2}
          listening={false}
        />
      )}

      
      {isCropping && (
        <Rect
          x={el.x}
          y={el.y}
          width={el.crop?.width || el.width}
          height={el.crop?.height || el.height}
          stroke="#fbbf24"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
          listening={false}
        />
      )}

     
      <Image
        id={el.id}
        ref={shapeRef}
        image={image}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        crop={el.crop}
        draggable={isSelected && !isCropping}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleDragEnd}
        rotation={el.rotation || 0}
      />

      
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={!isCropping}
          rotateEnabled={!isCropping}
          enabledAnchors={
            isCropping
              ? ['top-left','top-right','bottom-left','bottom-right']
              : ['top-left','top-right','bottom-left','bottom-right','middle-left','middle-right','top-center','bottom-center']
          }
          anchorFill={isCropping ? "#fbbf24" : "#8b5cf6"}
          anchorStroke={isCropping ? "#fbbf24" : "#8b5cf6"}
          borderStroke={isCropping ? "#fbbf24" : "#8b5cf6"}
        />
      )}

  
      {isCropping && (
        <Group
          onClick={handleApplyCrop}
          onTap={handleApplyCrop}
          x={el.x + (el.width / 2) - 50}
          y={el.y + el.height + 20}
          listening={true}
        >
          <Rect width={100} height={30} fill="#fbbf24" cornerRadius={4} />
          <Text
            width={100}
            height={30}
            text="APPLY CROP"
            fill="black"
            align="center"
            verticalAlign="middle"
            fontSize={12}
          />
        </Group>
      )}
    </Group>
  );
};

export default URLImage;