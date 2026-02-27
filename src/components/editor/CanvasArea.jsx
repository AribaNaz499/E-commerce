import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { CanvasContext } from '../../context/CanvasContext.jsx';
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";
import CanvasVideo from "../../canvas/CanvasVideo.jsx";
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer.jsx";
import CanvasQRCode from "../../canvas/CanvasQRCode.jsx"; 

const CanvasArea = () => {
  const { 
    elements, selectedId, setSelectedId, updateElement,
    audioFile, setAudioFile, videoFile, setVideoFile,
    isAudioPlaying, setIsAudioPlaying,
    canvasBg, stageRef, getPreviewDimensions 
  } = useContext(CanvasContext);

  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.8);
  const dims = getPreviewDimensions();

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      // Mobile par 40px padding thori zyada ho sakti hai, 20px is better
      const containerWidth = containerRef.current.offsetWidth - 20;
      const containerHeight = containerRef.current.offsetHeight - 20;
      
      const scaleX = containerWidth / dims.width;
      const scaleY = containerHeight / dims.height;
      
      // Scale ko 1 se zyada nahi hone dena taake quality kharab na ho
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    }
  }, [dims.width, dims.height]); 

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    // Orientation change (mobile rotate) handle karne ke liye
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [updateDimensions]); 

  const handleStageClick = (e) => {
    // Mobile Fix: Check if clicked on empty space
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const canvasWidth = dims.width * scale;
  const canvasHeight = dims.height * scale;

  return (
    <div 
      ref={containerRef} 
      className="flex-1 h-full bg-[#f1f5f9] flex items-center justify-center overflow-hidden p-2 sm:p-4"
    >
      <div 
        className="shadow-2xl bg-white overflow-hidden rounded-lg transition-all duration-300"
        style={{ 
          width: canvasWidth, 
          height: canvasHeight,
          // Mobile centering fix
          touchAction: 'none' 
        }}
      >
        <Stage
          ref={stageRef}
          width={dims.width}
          height={dims.height}
          scaleX={scale}
          scaleY={scale}
          // Mouse events for Desktop
          onMouseDown={handleStageClick}
          // Touch events for Mobile (Very Important)
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background Rect - iska name 'background' selection clear karne ke kaam aata hai */}
            <Rect 
              width={dims.width} 
              height={dims.height} 
              fill={canvasBg} 
              name="background" 
              onTap={() => setSelectedId(null)}
            />
            
            {/* 1. Video Layer */}
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

            {/* 2. Elements Layer (QR, Images, Stickers, Text) */}
            {elements.map((el) => {
              if (el?.type === 'qrcode') {
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

              if (el?.type === 'image' || el?.type === 'sticker') {
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

              if (el?.type === 'text') {
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

            {/* 3. Audio Layer (Top par rakha hai taake controls hamesha clickable hon) */}
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