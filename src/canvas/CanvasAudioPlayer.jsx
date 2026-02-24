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

  // Play/Pause Click Handler - FIXED
  const handlePlayPause = (e) => {
    // 1. Stop propagation to prevent drag/select
    e.cancelBubble = true;
    
    // 2. Stop Konva from starting a drag sequence
    if (e.evt) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
    }
    
    // 3. Reset cursor immediately to avoid "sticking"
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'default';
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
        rotation={audioData.rotation || 0}
        scaleX={audioData.scaleX || 1}
        scaleY={audioData.scaleY || 1}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        // Cursor management for the whole group
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = 'move';
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = 'default';
        }}
        onDragEnd={(e) => {
          onChange({
            ...audioData,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          onChange({
            ...audioData,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        }}
      >
        <Rect
          width={180}
          height={50}
          fill="white"
          cornerRadius={25}
          shadowBlur={10}
          shadowOpacity={0.1}
          stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
          strokeWidth={2}
        />

        {/* Play/Pause Button - WITH FIXES */}
       <Group 
  x={8}
  y={8}

  // STOP DRAG BEFORE IT STARTS
  onMouseDown={(e) => {
    e.cancelBubble = true;
    shapeRef.current.stopDrag();   // stop parent drag
  }}

  onTouchStart={(e) => {
    e.cancelBubble = true;
    shapeRef.current.stopDrag();
  }}

  onClick={(e) => {
    e.cancelBubble = true;
    onTogglePlay();
  }}

  onTap={(e) => {
    e.cancelBubble = true;
    onTogglePlay();
  }}

  onMouseEnter={(e) => {
    const stage = e.target.getStage();
    stage.container().style.cursor = "pointer";
  }}

  onMouseLeave={(e) => {
    const stage = e.target.getStage();
    stage.container().style.cursor = "move";
  }}
>
          <Rect width={34} height={34} fill="#3b82f6" cornerRadius={17} />
          <KonvaText
            text={isPlaying ? "⏸" : "▶"}
            fontSize={16}
            fill="white"
            x={isPlaying ? 10 : 13}
            y={8}
            fontStyle="bold"
            listening={false} // Prevents text from catching events
          />
        </Group>

        <KonvaText
          text="BACKGROUND MUSIC"
          x={50} y={12}
          fontSize={7}
          fontStyle="bold"
          fill="#94a3b8"
          letterSpacing={1}
          listening={false}
        />
        <KonvaText
          text={formatName(audioData.name)}
          x={50} y={24}
          fontSize={10}
          fontStyle="bold"
          fill="#1e293b"
          listening={false}
        />
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorFill="white"
          anchorStroke="#3b82f6"
          anchorSize={8}
          borderStroke="#3b82f6"
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CanvasAudioPlayer;