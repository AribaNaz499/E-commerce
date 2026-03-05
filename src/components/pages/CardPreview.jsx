import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Edit3, Lock } from 'lucide-react';
import { Stage, Layer, Rect } from 'react-konva';
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";
import CanvasVideo from "../../canvas/CanvasVideo";
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer";

const CardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allSlides, orientation, designName } = location.state || {};
  
  const [currentPage, setCurrentPage] = useState(1); 
  const [isPlaying, setIsPlaying] = useState(false);

  if (!allSlides) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Design Found</h2>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canvasSize = orientation === 'portrait' 
    ? { width: 400, height: 550 } 
    : { width: 700, height: 450 };

  const previewSize = orientation === 'portrait' 
    ? { width: 300, height: 420 } 
    : { width: 500, height: 330 };

  const scaleX = previewSize.width / canvasSize.width;
  const scaleY = previewSize.height / canvasSize.height;


  const isSlideLocked = (slideNum) => {
    return slideNum === 1 || slideNum === 4;
  };

  const RenderSlide = ({ slideNum }) => {
    const slide = allSlides[slideNum];
    if (!slide) return null;
    
    const elements = slide.elements || [];
    const bgColor = slide.bg || '#ffffff';
    const isLocked = isSlideLocked(slideNum);

    return (
      <div 
        className="w-full h-full overflow-hidden relative"
        style={{ backgroundColor: bgColor }}
      >
      
        {isLocked && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-20 pointer-events-none">
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Lock size={12} /> Locked
            </div>
          </div>
        )}

        <Stage 
          width={previewSize.width} 
          height={previewSize.height} 
          scaleX={scaleX} 
          scaleY={scaleY}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              fill={bgColor}
              listening={false}
            />
            {elements.map((el) => {
              if (!el) return null;
              
              
              const elementProps = {
                key: el.id,
                el: el,
                isSelected: false,
                onChange: () => {}
              };

              if (el.type === 'text') {
                return <EditableText {...elementProps} />;
              }
              
              if (el.type === 'image' || el.type === 'qrcode' || (el.src && !el.src.endsWith('.mp3') && !el.src.endsWith('.mp4'))) {
                return <URLImage {...elementProps} />;
              }
              
              if (el.type === 'video' || (el.src && el.src.endsWith('.mp4'))) {
                return <CanvasVideo {...elementProps} />;
              }
              
              if (el.type === 'audio' || (el.src && el.src.endsWith('.mp3'))) {
                return (
                  <CanvasAudioPlayer 
                    {...elementProps}
                    audioData={el}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                  />
                );
              }
              
              return null;
            })}
          </Layer>
        </Stage>

      
        {elements.some(el => el.type === 'audio' || el.type === 'video' || el.src?.endsWith('.mp3') || el.src?.endsWith('.mp4')) && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {elements.some(el => el.type === 'audio' || el.src?.endsWith('.mp3')) && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">🎵</span>
            )}
            {elements.some(el => el.type === 'video' || el.src?.endsWith('.mp4')) && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">🎬</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch(currentPage) {
      case 1: 
        return (
          <div className="relative" style={{ width: previewSize.width, height: previewSize.height }}>
            <RenderSlide slideNum={1} />
            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Lock size={12} /> Front Cover
            </div>
          </div>
        );
      
      case 2: 
        return (
          <div className="flex" style={{ width: previewSize.width * 2, height: previewSize.height }}>
            <div className="relative w-1/2 h-full border-r border-gray-300">
              <RenderSlide slideNum={2} />
              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                Inside Left
              </div>
            </div>
            <div className="relative w-1/2 h-full">
              <RenderSlide slideNum={3} />
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                Inside Right
              </div>
            </div>
          </div>
        );
      
      case 3: 
        return (
          <div className="relative" style={{ width: previewSize.width, height: previewSize.height }}>
            <RenderSlide slideNum={4} />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Lock size={12} /> Back Cover
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-8 font-sans">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 px-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        
        <h1 className="text-xl font-bold text-gray-800">{designName || "Card Preview"}</h1>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit3 size={16} /> Edit
          </button>
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm text-white shadow-md hover:bg-blue-700">
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-2xl mt-4 overflow-x-auto">
        <div className="flex justify-center">
          {renderCurrentView()}
        </div>
      </div>

      <div className="mt-8 flex gap-3 bg-white p-1.5 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={() => setCurrentPage(1)}
          className={`px-8 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            currentPage === 1 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Lock size={14} /> Front Cover
        </button>
        <button
          onClick={() => setCurrentPage(2)}
          className={`px-8 py-3 rounded-lg font-medium text-sm transition-all ${
            currentPage === 2 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Inside
        </button>
        <button
          onClick={() => setCurrentPage(3)}
          className={`px-8 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            currentPage === 3 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Lock size={14} /> Back Cover
        </button>
      </div>

      
      {(currentPage === 2) && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'} Audio/Video
          </button>
        </div>
      )}

      
      <div className="mt-4 text-xs text-gray-400">
        {currentPage === 1 && "📕 Front Cover (Locked)"}
        {currentPage === 2 && "📖 Inside Pages (Editable)"}
        {currentPage === 3 && "📕 Back Cover (Locked)"}
      </div>
    </div>
  );
};

export default CardPreview;