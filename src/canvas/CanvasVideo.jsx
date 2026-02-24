import React, { useEffect, useRef, useState } from "react";
import { Image, Group, Transformer, Rect, Text } from "react-konva";

const CanvasVideo = ({ videoUrl, el, isSelected, onSelect, onChange }) => {
  const groupRef = useRef(null);
  const imageRef = useRef(null);
  const trRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { x = 50, y = 50, width = 320, height = 200, rotation = 0 } = el || {};

  useEffect(() => {
    if (!videoUrl) return;
    const vid = document.createElement("video");
    vid.src = videoUrl;
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.crossOrigin = "Anonymous";

    vid.addEventListener("canplay", () => {
      setVideo(vid);
      vid.play().catch(() => {});
      setIsPlaying(true);
    });
    return () => vid.pause();
  }, [videoUrl]);

  useEffect(() => {
    if (!video) return;
    let anim;
    const update = () => {
      imageRef.current?.getLayer()?.batchDraw();
      anim = requestAnimationFrame(update);
    };
    anim = requestAnimationFrame(update);
    return () => cancelAnimationFrame(anim);
  }, [video]);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        ref={groupRef}
        x={x} y={y} rotation={rotation}
        draggable={isSelected}
        onClick={(e) => { e.cancelBubble = true; onSelect(); }}
        onTap={(e) => { e.cancelBubble = true; onSelect(); }}
        onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({
            ...el,
            x: node.x(), y: node.y(),
            width: Math.max(50, width * scaleX),
            height: Math.max(50, height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <Image ref={imageRef} image={video} width={width} height={height} />
        {isSelected && (
          <Group x={width / 2 - 25} y={height / 2 - 25} onClick={(e) => {
            e.cancelBubble = true;
            isPlaying ? video.pause() : video.play();
            setIsPlaying(!isPlaying);
          }}>
            <Rect width={50} height={50} cornerRadius={25} fill="rgba(0,0,0,0.6)" />
            <Text text={isPlaying ? "❚❚" : "▶"} fontSize={20} fill="white" x={isPlaying ? 17 : 20} y={14} listening={false} />
          </Group>
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorFill="#ffffff"
          anchorStroke="#8b5cf6"
          borderStroke="#8b5cf6"
          keepRatio={false}
        />
      )}
    </>
  );
};

export default CanvasVideo;