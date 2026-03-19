import React, { useRef } from "react";
import { Group, Rect, Text as KonvaText } from "react-konva";

const CanvasAudioPlayer = ({ audioData, isSelected, onSelect, onChange, isPlaying, onTogglePlay, onDragStart, onDragMove, onDragEnd }) => {
  const shapeRef = useRef();
  
  const currentWidth = audioData.width || 180;
  const currentHeight = audioData.height || 50;

  return (
    <Group
      id={audioData.id}
      ref={shapeRef}
      x={audioData.x}
      y={audioData.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        onChange({ ...audioData, x: e.target.x(), y: e.target.y() });
        onDragEnd?.(e);
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          ...audioData,
          x: node.x(),
          y: node.y(),
          width: Math.max(100, currentWidth * scaleX),
          height: Math.max(40, currentHeight * scaleY),
        });
      }}
    >
      <Rect
        width={currentWidth}
        height={currentHeight}
        fill="white"
        cornerRadius={currentHeight / 2}
        shadowBlur={10}
        shadowOpacity={0.1}
        stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
        strokeWidth={2}
      />

      <Group
        x={8}
        y={(currentHeight / 2) - 17}
        onClick={(e) => { e.cancelBubble = true; onTogglePlay(); }}
      >
        <Rect width={34} height={34} fill="#3b82f6" cornerRadius={17} />
        <KonvaText
          text={isPlaying ? "⏸" : "▶"}
          fontSize={14}
          fill="white"
          x={isPlaying ? 11 : 13}
          y={10}
        />
      </Group>

      <KonvaText
        text={audioData.name?.substring(0, 15) + "..." || "Audio"}
        x={50}
        y={(currentHeight / 2) - 5}
        fontSize={currentHeight * 0.2}
        fontStyle="bold"
        fill="#1e293b"
        width={currentWidth - 60}
      />
    </Group>
  );
};

export default CanvasAudioPlayer;