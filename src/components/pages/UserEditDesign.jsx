import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../../supabase/client";
import { CanvasContext } from "../../context/CanvasContext";
import CanvasArea from "../../components/editor/CanvasArea";
import ToolPanel from "../../components/editor/ToolPanel";
import { 
  ImageIcon, Type, Smile, ArrowLeft, Layout, Lock, X 
} from 'lucide-react';

const UserEditDesign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(CanvasContext);

  if (!context) return <div className="h-screen flex items-center justify-center font-bold">Context Error!</div>;

  const { 
    elements, setElements,
    setCanvasBg, canvasBg,
    orientation, setOrientation,
    activeTool, setActiveTool,
    isToolPanelOpen, setIsToolPanelOpen,
    addText, addSticker, handleImageUpload,
    imageInputRef, setSelectedId
  } = context;

  const [fetching, setFetching] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  
  const [slidesData, setSlidesData] = useState({ 
    1: { elements: [], bg: "#ffffff" }, 
    2: { elements: [], bg: "#ffffff" }, 
    3: { elements: [], bg: "#ffffff" }, 
    4: { elements: [], bg: "#ffffff" } 
  });
  
  const [scale, setScale] = useState(1);
  const [designName, setDesignName] = useState("");

  const isLockedSlide = currentSlide === 1 || currentSlide === 4;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const sidebarWidth = width >= 768 ? 80 : 0;
      const panelWidth = (isToolPanelOpen && width >= 768) ? 320 : 0;
      const availableWidth = width - sidebarWidth - panelWidth - 60;
      const baseWidth = orientation === 'portrait' ? 400 : 700;
      setScale(Math.min(availableWidth / baseWidth, 0.9));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [orientation, isToolPanelOpen]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;

        if (data) {
          setDesignName(data.name || "Untitled Design");
          const savedOrientation = data.orientation || data.content?.orientation || "portrait";
          setOrientation(savedOrientation);
          
          let initialElements = data.content?.elements || data.elements || [];
          const processed = initialElements.map((el, i) => ({
            ...el,
            id: el.id ? String(el.id) : `el-${Date.now()}-${i}`
          }));

          const logoElement = {
            id: 'permanent-logo',
            type: 'image',
            src: 'https://placehold.co/100x100?text=Logo', 
            x: 150, y: 400, width: 100, height: 100,
            draggable: false, isFixed: true
          };

          setSlidesData({ 
            1: { elements: processed, bg: "#ffffff" }, 
            2: { elements: [], bg: "#ffffff" }, 
            3: { elements: [], bg: "#ffffff" }, 
            4: { elements: [logoElement], bg: "#ffffff" } 
          });

          setElements(processed);
          setCanvasBg("#ffffff");
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [id]);



 
  const handleSlideChange = (nextSlide) => {
    if (nextSlide === currentSlide) return;

   
    setSlidesData(prev => ({
      ...prev,
      [currentSlide]: { elements: [...elements], bg: canvasBg }
    }));

    
    const nextData = slidesData[nextSlide] || { elements: [], bg: "#ffffff" };
    
   
    setElements([...(nextData.elements || [])]);
    
   
    if (nextSlide === 1 || nextSlide === 4) {
      setCanvasBg("#ffffff");
    } else {
      setCanvasBg(nextData.bg || "#ffffff");
    }

    setCurrentSlide(nextSlide);
    setSelectedId(null);
    setIsToolPanelOpen(false);
  };


  const handleBgChange = (newColor) => {
    if (isLockedSlide) return; 
    setCanvasBg(newColor);
  };


  const handlePreview = () => {
  const finalSlidesData = {
    ...slidesData,
    [currentSlide]: { elements: [...elements], bg: canvasBg }
  };

  navigate('/card-preview', { 
    state: { 
      allSlides: finalSlidesData,
      orientation: orientation,
      designName: designName 
    } 
  });
};

  if (fetching) return <div className="h-screen flex items-center justify-center">Loading Design...</div>;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b px-4 flex items-center justify-between z-50">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-blue-600">
          <ArrowLeft size={20}/>
        </button>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[1, 2, 3, 4].map((num) => (
            <button 
              key={num} 
              onClick={() => handleSlideChange(num)} 
              className={`w-12 h-12 rounded-lg text-sm font-black transition-all ${
                currentSlide === num ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {num === 1 ? 'F' : num === 4 ? 'B' : num}
            </button>
          ))}
        </div>
        
        <button   onClick ={handlePreview}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase shadow-lg">
          Preview
        </button>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        
        <aside className="w-20 bg-white border-r flex flex-col items-center py-8 gap-8 z-40">
          <SidebarBtn icon={<ImageIcon/>} active={activeTool === 'image'} onClick={() => {setActiveTool('image'); setIsToolPanelOpen(true);}} disabled={isLockedSlide} />
          <SidebarBtn icon={<Type/>} active={activeTool === 'text'} onClick={() => {setActiveTool('text'); setIsToolPanelOpen(true);}} disabled={isLockedSlide} />
          <SidebarBtn icon={<Smile/>} active={activeTool === 'sticker'} onClick={() => {setActiveTool('sticker'); setIsToolPanelOpen(true);}} disabled={isLockedSlide} />
          <SidebarBtn icon={<Layout/>} active={activeTool === 'layout'} onClick={() => {setActiveTool('layout'); setIsToolPanelOpen(true);}} disabled={isLockedSlide} />
        </aside>

        
        {isToolPanelOpen && !isLockedSlide && (
          <div className="w-80 bg-white border-r shadow-xl z-30 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <span className="font-bold text-xs uppercase tracking-widest">{activeTool}</span>
              <button onClick={() => setIsToolPanelOpen(false)}><X size={18}/></button>
            </div>
            <ToolPanel 
              addText={addText} 
              addSticker={addSticker} 
              handleImageUpload={handleImageUpload} 
              imageInputRef={imageInputRef}
              canvasBg={canvasBg} 
              setCanvasBg={handleBgChange} 
              activeTool={activeTool}
            />
          </div>
        )}

      
        <main className="flex-1 flex items-center justify-center bg-[#F1F5F9] p-10 overflow-auto">
          <div style={{ transform: `scale(${scale})`, transition: 'transform 0.2s ease-out' }}>
            <div className="bg-white shadow-2xl rounded-2xl border-[15px] border-white relative">
              {isLockedSlide && (
                <div className="absolute top-4 left-4 z-50 bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 backdrop-blur-md">
                  <Lock size={12} /> {currentSlide === 1 ? "Front Cover" : "Back Cover"}
                </div>
              )}
              <CanvasArea elements={elements} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarBtn = ({ icon, active, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`p-3 rounded-xl transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'
    } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
  >
    {React.cloneElement(icon, { size: 24 })}
  </button>
);

export default UserEditDesign;