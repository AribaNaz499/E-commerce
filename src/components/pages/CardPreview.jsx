import React, { useState, useEffect, useRef } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Edit3, Lock } from 'lucide-react';
import { Stage, Layer, Rect } from 'react-konva';
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";
import CanvasVideo from "../../canvas/CanvasVideo";
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer";
import { useCart } from '../../context/CartContext';

const CardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allSlides, orientation, designName, id } = location.state || {};

  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();
  const [isPlaying, setIsPlaying] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const stageRef = useRef(null);

  const handleCart = async () => {
    let previewThumb = "";
    if (currentPage !== 1) {
      setCurrentPage(1);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (stageRef.current) {
      previewThumb = stageRef.current.toDataURL({ pixelRatio: 2 });
    } else {
      previewThumb = allSlides[1]?.image || "";
    }

    const cartItem = {
      id: id || `design-${Date.now()}`, 
      name: designName || "Eid Greetings",
      price: 600, 
      quantity: 1, 
      image: previewThumb, 
      orientation: orientation || "portrait",
      designData: allSlides 
    };
    addToCart(cartItem, false);
    navigate("/cart");
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!allSlides) return null;

  const isMobile = windowWidth < 768;
  const canvasBaseSize = orientation === 'portrait' ? { width: 400, height: 550 } : { width: 700, height: 450 };

  let previewWidth = isMobile ? windowWidth - 48 : (orientation === 'portrait' ? 400 : 550);
  if (currentPage === 2 && !isMobile) previewWidth = orientation === 'portrait' ? 740 : 900; 

  const scale = previewWidth / (currentPage === 2 && !isMobile ? canvasBaseSize.width * 2 : canvasBaseSize.width);
  const previewSize = {
    width: previewWidth,
    height: canvasBaseSize.height * scale
  };

  const isSlideLocked = (slideNum) => slideNum === 1 || slideNum === 4;

  const RenderSlide = ({ slideNum, isSpreadMember = false }) => {
    const slide = allSlides[slideNum];
    if (!slide) return null;
    const elements = slide.elements || [];
    const bgColor = slide.bg || '#ffffff';
    const isLocked = isSlideLocked(slideNum);
    const stageWidth = isSpreadMember && !isMobile ? previewSize.width / 2 : previewSize.width;

    return (
      <div
        className={`relative overflow-hidden transition-all duration-700 ease-in-out ${isLocked ? 'cursor-not-allowed' : ''}`}
        style={{ backgroundColor: bgColor, width: stageWidth, height: previewSize.height }}
      >
        <Stage
          ref={slideNum === 1 ? stageRef : null} 
          width={stageWidth}
          height={previewSize.height}
          scaleX={scale}
          scaleY={scale}
          className={isLocked ? "pointer-events-none" : ""}
        >
          <Layer>
            <Rect x={0} y={0} width={canvasBaseSize.width} height={canvasBaseSize.height} fill={bgColor} listening={false} />
            {elements.map((el) => {
              if (!el) return null;
              const commonProps = { el, isSelected: false, onChange: () => { }, draggable: false };
              if (el.type === 'text') return <EditableText key={el.id} {...commonProps} />;
              if (el.type === 'image' || el.type === 'qrcode' || (el.src && !el.src.endsWith('.mp3') && !el.src.endsWith('.mp4'))) {
                return <URLImage key={el.id} {...commonProps} />;
              }
              if (el.type === 'video' || (el.src && el.src.endsWith('.mp4'))) return <CanvasVideo key={el.id} {...commonProps} />;
              if (el.type === 'audio' || (el.src && el.src.endsWith('.mp3'))) {
                return <CanvasAudioPlayer key={el.id} {...commonProps} audioData={el} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} />;
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-4 font-sans overflow-x-hidden">
      
      <div className="w-full max-w-6xl flex flex-col justify-between items-center mb-4 px-4 gap-4 shrink-0">
        <div className="flex items-center justify-between w-full gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 font-medium">
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-base md:text-xl font-bold text-gray-800 truncate">
            {designName || "Card Preview"}
          </h1>
          <div className="w-10 md:hidden"></div> 
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => navigate(`/design-editor/${id}`)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700">
            <Edit3 size={16} /> Edit
          </button>
          <button onClick={handleCart} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-blue-200">
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full px-4 overflow-y-auto">
        <div className={`bg-white p-1.5 md:p-4 rounded-2xl shadow-xl transition-all duration-500 transform ${isMobile ? 'scale-100' : 'hover:scale-[1.01]'}`}>
          <div className="flex justify-center items-center overflow-hidden rounded-xl">
            
            <div key={currentPage} className="animate-in fade-in slide-in-from-right-4 duration-500">
                {currentPage === 1 && <RenderSlide slideNum={1} />}
                {currentPage === 2 && (
                    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row'}`}>
                        <RenderSlide slideNum={2} isSpreadMember={true} />
                        <RenderSlide slideNum={3} isSpreadMember={true} />
                    </div>
                )}
                {currentPage === 3 && <RenderSlide slideNum={4} />}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 mt-6 flex justify-center gap-1.5 md:gap-3 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 mx-4 shrink-0 z-50">
        {[
          { id: 1, label: "Front", lock: true },
          { id: 2, label: "Inside", lock: false },
          { id: 3, label: "Back", lock: true }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setCurrentPage(btn.id)}
            className={`px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-[11px] md:text-sm transition-all flex items-center gap-2 ${
                currentPage === btn.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {btn.lock && <Lock size={12} />} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CardPreview;