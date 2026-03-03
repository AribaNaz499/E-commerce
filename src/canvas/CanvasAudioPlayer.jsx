import React, { useRef } from "react";
import { Group, Rect, Text as KonvaText } from "react-konva";

const CanvasAudioPlayer = ({ audioData, isSelected, onSelect, onChange, isPlaying, onTogglePlay }) => {
  const shapeRef = useRef();

  return (
    <Group
      id={audioData.id}
      ref={shapeRef}
      x={audioData.x}
      y={audioData.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onTransformEnd={() => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: (audioData.width || 180) * scaleX,
          height: (audioData.height || 50) * scaleY,
        });
      }}
    >
      <Rect
        width={audioData.width || 180}
        height={audioData.height || 50}
        fill="white"
        cornerRadius={25}
        shadowBlur={10}
        shadowOpacity={0.1}
        stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
        strokeWidth={2}
      />
      
      <Group x={8} y={8} onClick={(e) => { e.cancelBubble = true; onTogglePlay(); }}>
        <Rect width={34} height={34} fill="#3b82f6" cornerRadius={17} />
        <KonvaText text={isPlaying ? "⏸" : "▶"} fontSize={14} fill="white" x={isPlaying ? 11 : 13} y={10} />
      </Group>

      <KonvaText
        text={audioData.name?.substring(0, 15) + "..." || "Audio"}
        x={50} y={18}
        fontSize={10}
        fontStyle="bold"
        fill="#1e293b"
      />
    </Group>
  );
};

export default CanvasAudioPlayer;