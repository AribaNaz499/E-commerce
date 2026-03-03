import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ChevronLeft, Loader2, Image as ImageIcon, Type, 
  ShieldCheck, Monitor, ChevronRight, Layout as LayoutIcon, 
  PlayCircle, Volume2, Sticker, Sparkles, X 
} from 'lucide-react';
import { UserCanvasContext, UserCanvasProvider } from "../../context/UserCanvasContext"; 
import { supabase } from "../../supabase/client";
import CanvasArea from "../editor/CanvasArea";
import ToolPanel from "../editor/ToolPanel";

const UserEditDesignContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(UserCanvasContext);
  
  if (!context) return <div className="h-screen flex items-center justify-center bg-slate-50 font-sans">Loading...</div>;

  const {
    currentSlide, setCurrentSlide, elements, setElements, setCanvasBg, 
    canvasBg, orientation, setOrientation, stageRef, activeTool, setActiveTool,
    imageInputRef, handleImageUpload
  } = context;

  const [designName, setDesignName] = useState("");
  const [fetching, setFetching] = useState(true);

  const slides = [
    { id: 0, label: "Preview", icon: <Monitor size={16}/>, editable: false },
    { id: 1, label: "Design", icon: <Sparkles size={16}/>, editable: true },
    { id: 2, label: "Message", icon: <Type size={16}/>, editable: true },
    { id: 3, label: "Branding", icon: <ShieldCheck size={16}/>, editable: false },
  ];

  useEffect(() => {
    const loadDesign = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        setDesignName(data.name);
        if (data.content) {
          setCanvasBg(data.content.canvasBg || "#ffffff");
          setElements(data.content.elements || []);
          setOrientation(data.content.config?.orientation || "portrait");
        }
      } catch (err) { console.error(err); }
      finally { setFetching(false); }
    };
    loadDesign();
  }, [id]);

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans antialiased text-slate-900">
      

      <nav className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-semibold text-sm"
          >
            <ChevronLeft size={18} /> Exit
          </button>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <h2 className="text-slate-700 font-bold text-sm">{designName || "Untitled Project"}</h2>
        </div>

        <button 
          onClick={() => setCurrentSlide(0)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-xs transition-all active:scale-95"
        >
          Preview Final
        </button>
      </nav>

    
      <div className="flex-1 flex overflow-hidden">
        
  
        <aside className="w-20 border-r border-slate-100 flex flex-col items-center py-8 gap-8 bg-white z-20 shadow-sm">
          {[
            { id: 'layout', icon: <LayoutIcon size={20}/>, label: 'Layout' },
            { id: 'text', icon: <Type size={20}/>, label: 'Text' },
            { id: 'photos', icon: <ImageIcon size={20}/>, label: 'Photos', action: () => imageInputRef.current.click() },
            { id: 'stickers', icon: <Sticker size={20}/>, label: 'Stickers' },
          ].map((tool) => (
            <button 
              key={tool.id}
              onClick={tool.action || (() => setActiveTool(activeTool === tool.id ? null : tool.id))}
              className={`flex flex-col items-center gap-1 transition-all ${activeTool === tool.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-3 rounded-xl ${activeTool === tool.id ? 'bg-blue-50' : ''}`}>
                {tool.icon}
              </div>
              <span className="text-[9px] font-bold uppercase">{tool.label}</span>
            </button>
          ))}
        </aside>

  
        {activeTool && slides[currentSlide].editable && (
          <div className="w-72 bg-white border-r border-slate-100 shadow-xl z-10 animate-in slide-in-from-left duration-300">
            <div className="h-14 border-b flex justify-between items-center px-4 bg-slate-50/50">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{activeTool} Settings</span>
              <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
              <ToolPanel />
            </div>
          </div>
        )}

    
        <main className={`flex-1 flex flex-col items-center justify-center p-10 bg-[#f1f5f9] relative transition-all duration-500`}>
           <div className="absolute top-6">
              <span className="px-4 py-1.5 bg-white shadow-sm text-blue-600 text-[10px] font-black rounded-full uppercase border border-slate-100">
                Current Step: {slides[currentSlide].label}
              </span>
           </div>

           <div className={`transition-all duration-700 ${!slides[currentSlide].editable ? 'pointer-events-none opacity-90 scale-95' : 'scale-100'}`}>
              {fetching ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <CanvasArea />}
           </div>
        </main>

        
        <div className="hidden 2xl:flex w-72 bg-white border-l border-slate-100 p-6 flex-col items-center justify-center">
            <div className="opacity-20 flex flex-col items-center grayscale">
               <ShieldCheck size={60} />
               <p className="mt-4 font-black text-xl italic underline">PREVIEW AREA</p>
            </div>
        </div>
      </div>

    
      <footer className="h-32 bg-white border-t border-slate-200 flex items-center justify-center gap-10 px-8 z-50">
        <button 
          onClick={() => setCurrentSlide(p => Math.max(0, p-1))} 
          className="p-3 bg-slate-50 rounded-full text-slate-400 disabled:opacity-20"
          disabled={currentSlide === 0}
        >
          <ChevronLeft size={20}/>
        </button>
        
        <div className="flex gap-4">
          {slides.map((s) => (
            <div 
              key={s.id} 
              onClick={() => setCurrentSlide(s.id)}
              className={`w-16 h-20 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all
                ${currentSlide === s.id ? 'border-blue-500 bg-blue-50 shadow-lg -translate-y-1' : 'border-slate-100 bg-slate-50 opacity-50'}`}
            >
              <div className={currentSlide === s.id ? 'text-blue-600' : 'text-slate-400'}>
                {s.icon}
              </div>
              <span className="text-[7px] font-bold mt-2 uppercase">{s.label}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setCurrentSlide(p => Math.min(3, p+1))} 
          className="p-3 bg-slate-50 rounded-full text-slate-400 disabled:opacity-20"
          disabled={currentSlide === 3}
        >
          <ChevronRight size={20}/>
        </button>
      </footer>

      <input type="file" ref={imageInputRef} className="hidden" onChange={(e) => handleImageUpload(e.target.files[0])} />
    </div>
  );
};

const UserEditDesign = () => (
  <UserCanvasProvider>
    <UserEditDesignContent />
  </UserCanvasProvider>
);

export default UserEditDesign;