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
    canvasBg, stageRef, getPreviewDimensions, orientation 
  } = useContext(CanvasContext);

  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.8);
  const dims = getPreviewDimensions();

  
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth - 40;
      const containerHeight = containerRef.current.offsetHeight - 40;
      
      const scaleX = containerWidth / dims.width;
      const scaleY = containerHeight / dims.height;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
    }
  }, [dims.width, dims.height]); 
  useEffect(() => {
    updateDimensions();
    
  
    window.addEventListener('resize', updateDimensions);
    
   
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]); 

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      setSelectedId(null);
    }
  };

 
  const canvasWidth = dims.width * scale;
  const canvasHeight = dims.height * scale;

  return (
    <div 
      ref={containerRef} 
      className="flex-1 h-full bg-[#f1f5f9] flex items-center justify-center overflow-hidden p-4"
    >
      <div 
        className="shadow-2xl bg-white overflow-hidden rounded-lg transition-all duration-300"
        style={{ 
          width: canvasWidth, 
          height: canvasHeight,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
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
          
            <Rect 
              width={dims.width} 
              height={dims.height} 
              fill={canvasBg} 
              name="background" 
            />
            
           
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