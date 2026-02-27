import React, { useRef, useEffect } from "react";
import { Group, Rect, Transformer, Text as KonvaText } from "react-konva";

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

  // Audio Play/Pause Trigger
  const handlePlayPause = (e) => {
    // Propagation rokna zaroori hai taake element select ya drag na ho jaye
    if (e) {
      e.cancelBubble = true;
      if (e.evt) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
      }
    }

    // Mobile logic: Jab hum yahan onTogglePlay call karte hain, 
    // toh parent component mein audio.play() call hona chahiye.
    onTogglePlay();

    // Cursor reset
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = 'default';
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
        draggable={isSelected} // Sirf selected ho tabhi drag ho (mobile fix)
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect(audioData.id);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect(audioData.id);
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
        {/* Main Background */}
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

        {/* Play/Pause Button Group */}
        <Group 
          x={8}
          y={8}
          // Mobile touches ke liye events
          onTap={handlePlayPause}
          onClick={handlePlayPause}
          // Button dabate waqt drag cancel karna
          onMouseDown={(e) => {
            e.cancelBubble = true;
            if (shapeRef.current) shapeRef.current.stopDrag();
          }}
          onTouchStart={(e) => {
            e.cancelBubble = true;
            if (shapeRef.current) shapeRef.current.stopDrag();
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
            listening={false}
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
          // Mobile fix: anchor size baraya hai taake touch asaan ho
          anchorSize={window.innerWidth < 768 ? 12 : 8}
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