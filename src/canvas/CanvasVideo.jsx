import React, { useEffect, useRef, useState } from "react";
import { Image, Group, Transformer, Rect, Text } from "react-konva";

const CanvasVideo = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const [videoElement, setVideoElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const vid = document.createElement("video");
    vid.src = el.src;
    vid.crossOrigin = "Anonymous";
    vid.loop = true;
    vid.muted = false; 
    vid.playsInline = true;
    
    vid.addEventListener("canplay", () => {
      setVideoElement(vid);
      const step = () => {
        shapeRef.current?.getLayer()?.batchDraw();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, [el.src]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const togglePlay = (e) => {
    if (e) e.cancelBubble = true; 
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Group
        id={el.id}
        ref={shapeRef}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        draggable={isSelected}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ ...el, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <Image
          image={videoElement}
          width={el.width}
          height={el.height}
          fill="#000"
          cornerRadius={8}
        />
        
        
        <Group 
          x={el.width / 2 - 25} 
          y={el.height / 2 - 25} 
          onClick={togglePlay} 
          onTap={togglePlay}
        >
          <Rect
            width={50}
            height={50}
            fill="rgba(0,0,0,0.5)"
            cornerRadius={25}
          />
          <Text
            text={isPlaying ? "❚❚" : "▶"}
            fill="white"
            fontSize={24}
            x={isPlaying ? 16 : 19}
            y={13}
            listening={false}
          />
        </Group>
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CanvasVideo;