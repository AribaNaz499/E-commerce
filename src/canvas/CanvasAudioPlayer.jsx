
import React, { useRef, useEffect } from "react";
import { Group, Rect, Transformer } from "react-konva";
import { Text as KonvaText } from "react-konva";

const CanvasAudioPlayer = ({ audioData, isSelected, onSelect, onChange, isPlaying, onTogglePlay }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const formatName = (name) => name?.length > 18 ? name.substring(0, 18) + "..." : name || "Audio";

  const handlePlayPause = (e) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
    }
    onTogglePlay();
  };

  if (!audioData) return null;

  return (
    <>
      <Group
        ref={shapeRef}
        id={audioData.id}
        x={audioData.x || 100}
        y={audioData.y || 100}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...audioData, x: e.target.x(), y: e.target.y() })}
      >
        <Rect
          width={180}  
          height={50}
          fill="white"
          cornerRadius={25}
          shadowBlur={10}
          shadowOpacity={0.1}
          stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
          strokeWidth={2}  // border
        />


        <Group x={8} y={8} onClick={handlePlayPause}>
          <Rect width={34} height={34} fill="#3b82f6" cornerRadius={17} />
          <KonvaText
            text={isPlaying ? "⏸" : "▶"}
            fontSize={16}
            fill="white"
            x={isPlaying ? 10 : 13}
            y={8}
            fontStyle="bold"
          />
        </Group>

        <KonvaText
          text="BACKGROUND MUSIC"
          x={50}
          y={12}
          fontSize={7}
          fontStyle="bold"
          fill="#94a3b8"
          letterSpacing={1}
        />
        <KonvaText
          text={formatName(audioData.name)}
          x={50}
          y={24}
          fontSize={10}
          fontStyle="bold"
          fill="#1e293b"
        />
      </Group>

      {/* Audio player ke liye transformer */}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum size limit
            if (newBox.width < 100 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CanvasAudioPlayer;