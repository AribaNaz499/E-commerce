import React, { useContext, useEffect, useState, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { CanvasContext } from '../../context/CanvasContext.jsx';
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";
import CanvasVideo from "../../canvas/CanvasVideo.jsx";
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer.jsx";
// 🔥 Naya QR Code component import karein
import CanvasQRCode from "../../canvas/CanvasQRCode.jsx"; 

const CanvasArea = () => {
  const { 
    elements, selectedId, setSelectedId, updateElement,
    audioFile, setAudioFile, videoFile, setVideoFile,
    isAudioPlaying, setIsAudioPlaying,
    canvasBg, stageRef, getPreviewDimensions, orientation 
  } = useContext(CanvasContext);

  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.8);
  const dims = getPreviewDimensions();

  useEffect(() => {
    if (containerRef.current) {
      const scaleX = (containerRef.current.offsetWidth - 40) / dims.width;
      const scaleY = (containerRef.current.offsetHeight - 40) / dims.height;
      setScale(Math.min(scaleX, scaleY, 1));
    }
  }, [orientation, dims]);

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      setSelectedId(null);
    }
  };

  return (
    <div ref={containerRef} className="flex-1 h-full bg-[#f1f5f9] flex items-center justify-center overflow-hidden">
      <div className="shadow-2xl bg-white overflow-hidden" style={{ width: dims.width * scale, height: dims.height * scale }}>
        <Stage
          ref={stageRef}
          width={dims.width}
          height={dims.height}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* 1. Background */}
            <Rect width={dims.width} height={dims.height} fill={canvasBg} name="background" />
            
            {/* 2. Video Rendering */}
            {videoFile && (
              <CanvasVideo 
                key={videoFile.id}
                el={videoFile} 
                videoUrl={videoFile.url} 
                isSelected={selectedId === videoFile.id} 
                onSelect={() => setSelectedId(videoFile.id)}
                onChange={(updated) => setVideoFile(updated)}
              />
            )}

            {/* 3. Elements Mapping (Images, Stickers, Text, and QR Code) */}
            {elements.map((el) => {
              // --- QR CODE LOGIC ---
              if (el.type === 'qrcode') {
                return (
                  <CanvasQRCode
                    key={el.id}
                    el={el}
                    isSelected={selectedId === el.id}
                    onSelect={() => setSelectedId(el.id)}
                    onChange={updateElement}
                  />
                );
              }

              // --- IMAGE & STICKER LOGIC ---
              if (el.type === 'image' || el.type === 'sticker') {
                return (
                  <URLImage 
                    key={el.id} 
                    el={el} 
                    isSelected={selectedId === el.id} 
                    onSelect={() => setSelectedId(el.id)} 
                    onChange={updateElement} 
                  />
                );
              }

              // --- TEXT LOGIC ---
              if (el.type === 'text') {
                return (
                  <EditableText 
                    key={el.id} 
                    el={el} 
                    isSelected={selectedId === el.id} 
                    onSelect={() => setSelectedId(el.id)} 
                    onChange={updateElement} 
                  />
                );
              }
              return null;
            })}

            {/* 4. Audio Rendering */}
            {audioFile && (
              <CanvasAudioPlayer 
                audioData={audioFile}
                isSelected={selectedId === audioFile.id}
                onSelect={() => setSelectedId(audioFile.id)}
                onChange={(updated) => setAudioFile(updated)}
                isPlaying={isAudioPlaying}
                onTogglePlay={() => setIsAudioPlaying(!isAudioPlaying)}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CanvasArea;