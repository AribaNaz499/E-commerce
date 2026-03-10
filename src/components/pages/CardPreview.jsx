import React, { useState, useEffect } from 'react';
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


const handleCart = () => {
  const frontSlide = allSlides[0] || allSlides[1]; 
  let previewThumb = "";

  if (frontSlide && frontSlide.elements) {
    const firstImageEl = frontSlide.elements.find(el => (el.type === 'image' || el.type === 'qrcode' || el.src) && typeof el.src === 'string');
    previewThumb = firstImageEl ? firstImageEl.src : ""; 
  }

  const cartItem = {
    id: id || `design-${Date.now()}`, 
    name: designName || "Eid Greetings",
    price: 15.00, 
    quantity: 1, 
    image: previewThumb, 
    orientation: orientation || "portrait",
    designData: allSlides 
  };

  // IMPORTANT: 'false' pass karne se modal nahi khulega
  addToCart(cartItem, false);

  // Navigate karein checkout page par
  navigate("/cart");
};

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!allSlides) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Design Found</h2>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isMobile = windowWidth < 768;
  const canvasBaseSize = orientation === 'portrait' ? { width: 400, height: 550 } : { width: 700, height: 450 };

  let previewWidth = isMobile ? windowWidth - 40 : (orientation === 'portrait' ? 400 : 550);
  if (currentPage === 2 && !isMobile) previewWidth = orientation === 'portrait' ? 700 : 900; // Desktop Spread

  const scale = previewWidth / (currentPage === 2 && !isMobile ? canvasBaseSize.width * 2 : canvasBaseSize.width);
  const previewSize = {
    width: previewWidth,
    height: canvasBaseSize.height * (previewWidth / (currentPage === 2 && !isMobile ? canvasBaseSize.width * 2 : canvasBaseSize.width))
  };

  const isSlideLocked = (slideNum) => slideNum === 1 || slideNum === 4;

  const handleBackToEdit = () => {
    if (!id) return navigate(-1);
    navigate(`/design-editor/${id}`, { state: { fromPreview: true } });
  };


  const RenderSlide = ({ slideNum, isSpreadMember = false }) => {
    const slide = allSlides[slideNum];
    if (!slide) return null;

    const elements = slide.elements || [];
    const bgColor = slide.bg || '#ffffff';
    const isLocked = isSlideLocked(slideNum);

    const stageWidth = isSpreadMember && !isMobile ? previewSize.width / 2 : previewSize.width;

    return (
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isLocked ? 'cursor-not-allowed select-none' : 'cursor-default'}`}
        style={{ backgroundColor: bgColor, width: stageWidth, height: previewSize.height }}
      >
        {isLocked && <div className="absolute inset-0 z-[100] bg-transparent" />}

        <Stage
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
                return (
                  <CanvasAudioPlayer
                    key={el.id} {...commonProps} audioData={el}
                    isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentPage) {
      case 1: return <RenderSlide slideNum={1} />;
      case 2:
        return (
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row'}`}>
            <div className={`${!isMobile ? 'border-r border-gray-300' : ''}`}><RenderSlide slideNum={2} isSpreadMember={true} /></div>
            <div><RenderSlide slideNum={3} isSpreadMember={true} /></div>
          </div>
        );
      case 3: return <RenderSlide slideNum={4} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-4 md:py-8 font-sans overflow-hidden">

      <style dangerouslySetInnerHTML={{
        __html: `
        html, body { 
          overflow: hidden !important; 
          height: 100%;
          margin: 0;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 px-4 md:px-6 gap-4 shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} /> <span className="hidden md:inline">Back</span>
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate max-w-[180px] md:max-w-none">
            {designName || "Card Preview"}
          </h1>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleBackToEdit} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Edit3 size={16} /> Edit
          </button>
          <button onClick={handleCart} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm text-white shadow-md hover:bg-blue-700">
            <ShoppingCart size={16} /> <span className="whitespace-nowrap">Add to Cart</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full overflow-hidden px-4">
        <div className="bg-white p-2 md:p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500 max-h-full overflow-hidden">
          <div className="flex justify-center items-center">
            {renderCurrentView()}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2 md:gap-3 bg-white p-1.5 rounded-xl shadow-lg border border-gray-200 mx-4 shrink-0">
        {[
          { id: 1, label: "Front Cover", lock: true },
          { id: 2, label: "Inside", lock: false },
          { id: 3, label: "Back Cover", lock: true }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setCurrentPage(btn.id)}
            className={`px-4 md:px-8 py-2 md:py-3 rounded-lg font-medium text-xs md:text-sm transition-all flex items-center gap-2 ${currentPage === btn.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {btn.lock && <Lock size={14} />} {btn.label}
          </button>
        ))}
      </div>

      
    </div>
  );
};

export default CardPreview;