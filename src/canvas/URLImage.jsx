import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer, Group, Rect, Text } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ el, isSelected, onSelect, onChange }) => {
  // --- YE LINE CHANGE HUI HAI ---
  // crossOrigin: 'anonymous' add karne se 'Tainted Canvas' error khatam ho jata hai
  const [img] = useImage(el.src, 'anonymous'); 

  const shapeRef = useRef();
  const trRef = useRef();
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (img && (!el.crop || el.crop.width === 0)) {
      onChange({
        ...el,
        width: el.width || 200,
        height: el.height || 200,
        crop: { x: 0, y: 0, width: img.width, height: img.height }
      });
    }
  }, [img]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isCropping]);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    if (isCropping) {
      const newCrop = {
        x: el.crop.x + (node.x() - el.x) * (el.crop.width / el.width),
        y: el.crop.y + (node.y() - el.y) * (el.crop.height / el.height),
        width: el.crop.width * scaleX,
        height: el.crop.height * scaleY,
      };

      onChange({
        ...el,
        crop: newCrop,
        x: node.x(),
        y: node.y(),
      });
    } else {
      onChange({
        ...el,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation()
      });
    }
  };

  if (!img) return null;

  return (
    <Group>
      {isCropping && (
        <Image
          image={img}
          x={el.x} y={el.y}
          width={el.width} height={el.height}
          opacity={0.2}
          listening={false}
        />
      )}

      <Image
        id={el.id}
        ref={shapeRef}
        image={img}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        crop={el.crop}
        draggable={isSelected && !isCropping}
        onClick={onSelect}
        onDblClick={() => setIsCropping(true)}
        onTransformEnd={handleTransformEnd}
        onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
        rotation={el.rotation || 0}
      />

      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={!isCropping}
          rotateEnabled={!isCropping} 
          anchorFill={isCropping ? "#fbbf24" : "#ffffff"}
          anchorStroke={isCropping ? "#fbbf24" : "#3b82f6"}
        />
      )}

      {isCropping && (
        <Group onClick={() => setIsCropping(false)} style={{ cursor: 'pointer' }}>
          <Rect
            x={el.x} y={el.y + el.height + 15}
            width={100} height={32}
            fill="#fbbf24" cornerRadius={6}
            shadowBlur={5} shadowColor="#00000033"
          />
          <Text
            x={el.x} y={el.y + el.height + 15}
            width={100} height={32}
            text="APPLY CROP" fill="black"
            align="center" verticalAlign="middle"
            fontStyle="bold" fontSize={12}
          />
        </Group>
      )}
    </Group>
  );
};

export default URLImage;