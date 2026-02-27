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
    vid.crossOrigin = "Anonymous";
    vid.loop = true;
    vid.muted = true; // Mobile par autoplay ke liye TRUE hona lazmi hai
    
    // Mobile specific attributes
    vid.setAttribute("playsinline", "true");
    vid.setAttribute("webkit-playsinline", "true");
    vid.setAttribute("muted", "true");
    vid.preload = "auto";

    const handleCanPlay = () => {
      setVideo(vid);
      // Force play for mobile
      vid.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Manual play required or blocked", err));
    };

    vid.addEventListener("canplay", handleCanPlay);
    vid.load(); // Force load

    return () => {
      vid.pause();
      vid.removeEventListener("canplay", handleCanPlay);
      vid.src = "";
      vid.load();
    };
  }, [videoUrl]);

  // Frame update loop - Improved for mobile performance
  useEffect(() => {
    if (!video) return;

    let anim;
    const update = () => {
      // Check if video is actually ready to be drawn
      if (video.readyState >= 2) { 
        imageRef.current?.getLayer()?.batchDraw();
      }
      anim = requestAnimationFrame(update);
    };
    
    anim = requestAnimationFrame(update);
    return () => cancelAnimationFrame(anim);
  }, [video]);

  // Transformer logic
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const togglePlay = (e) => {
    if (e) e.cancelBubble = true;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x} y={y} rotation={rotation}
        draggable={isSelected}
        onClick={(e) => { 
          onSelect(); 
          // Agar video play nahi ho rahi mobile pe, toh first click isse start kar dega
          if(video && video.paused) togglePlay(e); 
        }}
        onTap={(e) => { 
          onSelect(); 
          if(video && video.paused) togglePlay(e);
        }}
        onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1); 
          node.scaleY(1);
          onChange({
            ...el,
            x: node.x(), y: node.y(),
            width: Math.max(50, width * scaleX),
            height: Math.max(50, height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        {/* Video Frame */}
        <Image 
          ref={imageRef} 
          image={video} 
          width={width} 
          height={height} 
          fill="#cccccc" // Jab tak video load na ho, grey box dikhega
        />

        {/* Play/Pause Button Overlay */}
        {isSelected && (
          <Group 
            x={width / 2 - 25} 
            y={height / 2 - 25} 
            onClick={togglePlay}
            onTap={togglePlay}
          >
            <Rect 
              width={50} 
              height={50} 
              cornerRadius={25} 
              fill="rgba(0,0,0,0.6)" 
            />
            <Text 
              text={isPlaying ? "❚❚" : "▶"} 
              fontSize={20} 
              fill="white" 
              x={isPlaying ? 17 : 20} 
              y={14} 
              listening={false} 
            />
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
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CanvasVideo;