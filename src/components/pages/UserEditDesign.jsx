import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../../supabase/client";
import { CanvasContext } from "../../context/CanvasContext";
import CanvasArea from "../../components/editor/CanvasArea";
import ToolPanel from "../../components/editor/ToolPanel";
import { 
  ImageIcon, Type, Smile, ArrowLeft, Layout, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

const UserEditDesign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(CanvasContext);
  
  if (!context) return <div className="h-screen flex items-center justify-center font-bold">Context Error!</div>;

  const { 
    elements, setElements, 
    setCanvasBg, 
    orientation, setOrientation, 
    activeTool, setActiveTool, 
    isToolPanelOpen, setIsToolPanelOpen 
  } = context;
  
  const [fetching, setFetching] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slidesData, setSlidesData] = useState({ 1: [], 2: [], 3: [], 4: [] });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        
        if (data) {
         
          let forcedOrientation = data.orientation || data.content?.orientation;

          if (!forcedOrientation && data.content?.elements) {
            const elements = data.content.elements;
            const isWide = elements.some(el => (el.x + (el.width || 0)) > 400);
            forcedOrientation = isWide ? 'landscape' : 'portrait';
          }

          setOrientation(forcedOrientation || "portrait");
          
          setCanvasBg(data.content?.canvasBg || "#ffffff");
          
        
          const initialElements = data.content?.elements || [];
          setSlidesData(prev => ({ ...prev, 1: initialElements }));
          setElements(initialElements);
        }
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally { 
        setFetching(false); 
      }
    };
    loadData();
  }, [id, setOrientation, setCanvasBg, setElements]);

  useEffect(() => {
    if (!fetching) {
      setSlidesData(prev => ({ ...prev, [currentSlide]: elements }));
    }
  }, [elements, fetching, currentSlide]);

  const handleSlideChange = (nextSlideId) => {
    setElements(slidesData[nextSlideId] || []);
    setCurrentSlide(nextSlideId);
    setActiveTool(null);
    setIsToolPanelOpen(false);
  };

  const handleToolClick = (tool) => {
    if (currentSlide === 1 || currentSlide === 4) return; 
    if (activeTool === tool && isToolPanelOpen) {
      setIsToolPanelOpen(false);
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      setIsToolPanelOpen(true);
    }
  };

  if (fetching) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <nav className="h-16 bg-white border-b px-6 flex items-center justify-between z-50 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600">
          <ArrowLeft size={18}/> Back
        </button>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border">
          {[1, 2, 3, 4].map((num) => (
            <button 
              key={num} 
              onClick={() => handleSlideChange(num)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${currentSlide === num ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>
              {num === 1 ? 'Front' : num === 4 ? 'Back' : `Side ${num}`}
            </button>
          ))}
        </div>
        
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs">Order Now</button>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 bg-white border-r flex flex-col items-center py-8 gap-8 z-40">
          <SidebarBtn icon={<ImageIcon/>} label="Media" active={activeTool === 'image'} onClick={() => handleToolClick('image')} />
          <SidebarBtn icon={<Type/>} label="Text" active={activeTool === 'text'} onClick={() => handleToolClick('text')} />
          <SidebarBtn icon={<Smile/>} label="Stickers" active={activeTool === 'sticker'} onClick={() => handleToolClick('sticker')} />
          <SidebarBtn icon={<Layout/>} label="Layout" active={activeTool === 'layout'} onClick={() => handleToolClick('layout')} />
        </aside>

        {isToolPanelOpen && (
          <div className="w-80 h-full bg-white border-r shadow-2xl z-30 flex-shrink-0">
             <ToolPanel />
          </div>
        )}

        <main className="flex-1 flex flex-col items-center justify-center p-8 relative bg-[#F1F5F9]">
          
        
          <div className={`relative transition-all duration-500 ease-in-out flex items-center justify-center
            ${orientation === 'portrait' ? 'h-[550px] aspect-[4/5]' : 'w-[700px] aspect-[1.5/1]'}
            ${isToolPanelOpen ? 'scale-90 -translate-x-4' : 'scale-100'}`}
          >
            <div className="absolute inset-4 bg-black/10 blur-[60px] rounded-full -z-10 translate-y-12"></div>
            
            <div className="h-full w-full bg-white rounded-2xl shadow-2xl border-[12px] border-white overflow-hidden relative flex items-center justify-center">
              <CanvasArea />
            </div>
          </div>

          <div className="absolute bottom-10 flex items-center gap-10">
            <button disabled={currentSlide === 1} onClick={() => handleSlideChange(currentSlide - 1)} className="p-3 bg-white rounded-full shadow-lg disabled:opacity-20"><ChevronLeft/></button>
            <div className="flex gap-2.5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className={`h-2 rounded-full transition-all duration-500 ${currentSlide === n ? 'w-10 bg-blue-500' : 'w-2 bg-slate-300'}`} />
              ))}
            </div>
            <button disabled={currentSlide === 4} onClick={() => handleSlideChange(currentSlide + 1)} className="p-3 bg-white rounded-full shadow-lg disabled:opacity-20"><ChevronRight/></button>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 w-full py-2 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
    <div className={`p-3.5 rounded-2xl ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>{icon}</div>
    <span className="text-[9px] font-black uppercase">{label}</span>
  </button>
);

export default UserEditDesign;