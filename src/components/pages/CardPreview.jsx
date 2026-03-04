import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Edit3 } from 'lucide-react';
import { Stage, Layer, Rect } from 'react-konva';
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";


const CardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allSlides, orientation, designName } = location.state || {};
  
  const [isOpen, setIsOpen] = useState(false);
  const [showBack, setShowBack] = useState(false);

  if (!allSlides) return <div className="h-screen flex items-center justify-center">No Design Found</div>;

  // Canvas Dimensions
  const dims = orientation === 'portrait' ? { w: 300, h: 420 } : { w: 450, h: 300 };

  // Helper component to render Konva inside the 3D card faces
  const RenderSlide = ({ slideNum }) => (
    <div className="w-full h-full shadow-inner overflow-hidden" style={{ background: allSlides[slideNum]?.bg || '#fff' }}>
      <Stage width={dims.w} height={dims.h} scaleX={dims.w/400} scaleY={dims.h/550}>
        <Layer>
          {allSlides[slideNum]?.elements.map((el) => {
            if (el.type === 'text') return <EditableText key={el.id} el={el} isSelected={false} />;
            if (el.type === 'image') return <URLImage key={el.id} el={el} isSelected={false} />;
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center py-10 font-sans">
      {/* Navbar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-12 px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium">
          <ArrowLeft size={20} /> Back to Editor
        </button>
        <h1 className="text-xl font-bold text-slate-800">{designName || "Preview"}</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg font-bold text-sm text-slate-700 shadow-sm">
            <Edit3 size={16}/> EDIT
          </button>
          <button className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg hover:bg-blue-700 transition-all">
            <ShoppingBag size={16}/> ADD TO BASKET
          </button>
        </div>
      </div>

      {/* 3D Card Container */}
      <div className="relative flex-1 flex items-center justify-center perspective-2000">
        <div 
          className={`relative transition-transform duration-1000 transform-style-3d ${isOpen ? 'rotate-y-[-180deg]' : ''} ${showBack ? 'rotate-y-[-360deg]' : ''}`}
          style={{ width: dims.w, height: dims.h }}
        >
          
          {/* FRONT COVER (Slide 1) */}
          <div className="absolute inset-0 z-20 backface-hidden shadow-2xl rounded-r-lg overflow-hidden border-l border-black/10">
            <RenderSlide slideNum={1} />
          </div>

          {/* INSIDE LEFT (Slide 2) */}
          <div className="absolute inset-0 z-10 rotate-y-180 backface-hidden shadow-2xl rounded-r-lg overflow-hidden border-r border-black/10">
            <RenderSlide slideNum={2} />
          </div>

          {/* INSIDE RIGHT (Slide 3) */}
          <div className="absolute inset-0 left-full z-0 origin-left shadow-2xl rounded-r-lg overflow-hidden" 
               style={{ width: dims.w, height: dims.h }}>
            <RenderSlide slideNum={3} />
          </div>

          {/* BACK COVER (Slide 4) */}
          <div className={`absolute inset-0 z-30 transition-opacity duration-500 rounded-lg overflow-hidden border-r border-black/10 ${showBack ? 'opacity-100' : 'opacity-0 pointer-events-none rotate-y-180'}`}>
            <RenderSlide slideNum={4} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-20 flex bg-white p-2 rounded-2xl shadow-xl gap-4 border border-slate-200">
        <button 
          onClick={() => {setIsOpen(false); setShowBack(false);}}
          className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${!isOpen && !showBack ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Front
        </button>
        <button 
          onClick={() => {setIsOpen(true); setShowBack(false);}}
          className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isOpen && !showBack ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Inside
        </button>
        <button 
          onClick={() => {setIsOpen(true); setShowBack(true);}}
          className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showBack ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default CardPreview;