import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "../../config/supabaseClient";
import { CanvasContext } from "../../context/CanvasContext";
import CanvasArea from "../../components/editor/CanvasArea";
import ToolPanel from "../../components/editor/ToolPanel";
import LayerPanel from "../../components/editor/LayerPannel";
import LogoImg from "../../assets/images/logo.png";
import {
  ImageIcon, Type, Smile, ArrowLeft, Layout, Lock
} from 'lucide-react';

const UserEditDesign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(CanvasContext);

  if (!context)
    return <div className="h-screen flex items-center justify-center font-bold">Context Error!</div>;

  const {
    elements, setElements,
    setCanvasBg, canvasBg,
    orientation, setOrientation,
    setActiveTool,
    isToolPanelOpen, setIsToolPanelOpen,
    setSelectedId,
    selectedId
  } = context;

  const [fetching, setFetching] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [designName, setDesignName] = useState("");
  const [scale, setScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [slidesData, setSlidesData] = useState({
    1: { elements: [], bg: "#ffffff" },
    2: { elements: [], bg: "#ffffff" },
    3: { elements: [], bg: "#ffffff" },
    4: { elements: [], bg: "#ffffff" }
  });

  const isLockedSlide = currentSlide === 1 || currentSlide === 4;

  const addFixedLogoToSlide4 = (slides, currentOrientation) => {
    const canvasWidth = currentOrientation === "landscape" ? 700 : 400;
    const canvasHeight = currentOrientation === "landscape" ? 450 : 550;
    const logoSize = currentOrientation === "landscape" ? 180 : 150;

    const hasLogo = slides[4]?.elements?.some(el => el.isLogo === true);
    if (!hasLogo) {
      const logo = {
        id: `logo-${Date.now()}`,
        type: "image",
        src: LogoImg,
        x: (canvasWidth / 2) - (logoSize / 2),
        y: (canvasHeight / 2) - (logoSize / 2),
        width: logoSize,
        height: logoSize,
        isLogo: true,
        isFixed: true,
        draggable: false,
        listening: false
      };
      slides[4] = {
        ...slides[4],
        elements: [...(slides[4]?.elements || []), logo]
      };
    }
    return slides;
  };

  const loadSlideFromDatabase = async (slideNum) => {
    try {
      const designId = parseInt(id);
      const { data, error } = await supabase
        .from("design_slides")
        .select("elements, bg_color")
        .eq("design_id", designId)
        .eq("slide_number", slideNum)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          elements: data.elements || [],
          bg: data.bg_color || "#ffffff"
        };
      }
      return null;
    } catch (error) {
      console.error(`❌ Load Slide ${slideNum} Error:`, error);
      return null;
    }
  };

  const saveSlideToDatabase = async (slideNum, slideElements, slideBg) => {
    if (fetching || !slideElements) return;
    try {
      const designId = parseInt(id);

      const { data: existingSlide } = await supabase
        .from("design_slides")
        .select("id")
        .eq("design_id", designId)
        .eq("slide_number", slideNum)
        .maybeSingle();

      const slideData = {
        design_id: designId,
        slide_number: slideNum,
        elements: slideElements,
        bg_color: slideBg,
        updated_at: new Date()
      };

      if (existingSlide) {
        await supabase.from("design_slides").update(slideData).eq("id", existingSlide.id);
      } else {
        await supabase.from("design_slides").insert([slideData]);
      }
    } catch (e) {
      console.error(`❌ Save Error Slide ${slideNum}:`, e);
    }
  };

  
  useEffect(() => {
    const loadDesign = async () => {
      if (!id) return;
      setFetching(true);

      try {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (productError) throw productError;

        let detectedOrientation = product.orientation || "portrait";
        if (!product.orientation && product.content?.elements) {
          const hasWide = product.content.elements.some(el => el.x > 500 || el.width > 500);
          detectedOrientation = hasWide ? "landscape" : "portrait";
        }
        setOrientation(detectedOrientation);

        const isFreshEdit = !location.state?.fromPreview;

        let finalSlides = {
          1: { elements: product.content?.elements || [], bg: product.content?.canvasBg || "#ffffff" },
          2: isFreshEdit ? { elements: [], bg: "#ffffff" } :
            (await loadSlideFromDatabase(2) || { elements: [], bg: "#ffffff" }),
          3: isFreshEdit ? { elements: [], bg: "#ffffff" } :
            (await loadSlideFromDatabase(3) || { elements: [], bg: "#ffffff" }),
          4: (await loadSlideFromDatabase(4)) || { elements: [], bg: "#ffffff" }
        };

        finalSlides = addFixedLogoToSlide4(finalSlides, detectedOrientation);

        setDesignName(product.name || "Untitled");
        setSlidesData(finalSlides);

        setElements([...finalSlides[1].elements]);
        setCanvasBg(finalSlides[1].bg);
        setCurrentSlide(1);

      } catch (err) {
        console.error("❌ Load error:", err);
      } finally {
        setFetching(false);
      }
    };

    loadDesign();
  }, [id, location.state?.fromPreview]); 

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const sidebarWidth = width >= 768 ? 80 : 0;
      const panelWidth = (isToolPanelOpen && width >= 768) ? 320 : 0;
      const availableWidth = width - sidebarWidth - panelWidth - 60;
      const baseWidth = orientation === "landscape" ? 700 : 400;
      setScale(Math.min(availableWidth / baseWidth, 0.9));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [orientation, isToolPanelOpen, fetching]);

  useEffect(() => {
    if (!fetching && !isLockedSlide && elements) {
      const timer = setTimeout(() => {
        // Update local state and DB
        setSlidesData(prev => ({
          ...prev,
          [currentSlide]: { elements: [...elements], bg: canvasBg }
        }));
        saveSlideToDatabase(currentSlide, elements, canvasBg);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [elements, canvasBg, fetching, currentSlide]);

  const handleSlideChange = async (nextSlide) => {
    if (nextSlide === currentSlide || fetching) return;

    await saveSlideToDatabase(currentSlide, elements, canvasBg);

    const nextData = slidesData[nextSlide] || { elements: [], bg: "#ffffff" };

    const processed = (nextData.elements || []).map(el => ({
      ...el,
      draggable: !(nextSlide === 1 || nextSlide === 4),
      isFixed: (nextSlide === 1 || nextSlide === 4),
      listening: !(nextSlide === 1 || nextSlide === 4)
    }));

    setElements(processed);
    setCanvasBg(nextData.bg);
    setCurrentSlide(nextSlide);
    setSelectedId(null);
    setIsToolPanelOpen(false);
  };

const handlePreview = async () => {
  setIsSaving(true);
  const stage = context.stageRef.current;
  
  setSelectedId(null);
  await new Promise(resolve => setTimeout(resolve, 100));

  
  const currentScreenshot = stage.toDataURL({ pixelRatio: 2 });

  
  const updatedSlides = {
    ...slidesData,
    [currentSlide]: { 
      ...slidesData[currentSlide],
      elements: [...elements], 
      bg: canvasBg,
      image: currentScreenshot 
    }
  };

  navigate("/card-preview", {
    state: { 
      allSlides: updatedSlides, 
      orientation, 
      designName, 
      id 
    }
  });
  setIsSaving(false);
};



const handleAddToCart = async () => {
    setIsSaving(true);
    
    const stage = context.stageRef.current;
    let screenshot = "";

    if (stage) {
        setSelectedId(null); 
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        screenshot = stage.toDataURL({ pixelRatio: 2 }); 
    }

    const itemToCart = {
        id: id,
        name: designName,
        orientation: orientation,
        price: 600,
        slide1_url: slidesData[1].elements[0]?.src || "", 
        slide2_url: currentSlide === 2 ? screenshot : (slidesData[2].image || ""), 
        slide3_url: currentSlide === 3 ? screenshot : (slidesData[3].image || ""),
        slide4_url: slidesData[4].elements[0]?.src || "",
        quantity: 1
    };

    context.addToCart(itemToCart); 
    alert("Design added to cart!");
    navigate("/cart");
};

  const handleBack = async () => {
    setIsSaving(true);
    await saveSlideToDatabase(currentSlide, elements, canvasBg);
    navigate(-1);
  };

  if (fetching) return <div className="h-screen flex items-center justify-center">Loading Design...</div>;

return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden fixed inset-0 select-none">
      
    
      <nav className="h-14 sm:h-16 bg-white border-b px-2 sm:px-4 flex items-center justify-between z-[100] shrink-0 shadow-sm">
        <button onClick={handleBack} className="text-slate-500 hover:text-blue-600 p-2">
          <ArrowLeft size={20} />
        </button>

        <div className="flex bg-slate-100 p-0 rounded-xl shadow-inner">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => handleSlideChange(num)}
              className={`relative transition-all rounded-lg flex items-center justify-center font-black mx-0.5
                ${currentSlide === num ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"}
                ${orientation === 'landscape' ? "w-10 h-7 sm:w-14 sm:h-10" : "w-8 h-10 sm:w-12 sm:h-14"}
              `}
            >
              <span className="text-[10px] sm:text-xs">{num === 1 ? "F" : num === 4 ? "B" : num}</span>
              {(num === 1 || num === 4) && (
                <Lock size={10} className={`absolute top-0 right-0 m-0.5 ${currentSlide === num ? "text-white/30" : "text-slate-400"}`} />
              )}
            </button>
          ))}
        </div>

        <button onClick={handlePreview} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase">
          Preview
        </button>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        
        <aside className="fixed bottom-0 left-0 right-0 md:relative md:w-20 bg-white border-t md:border-t-0 md:border-r flex md:flex-col flex-row items-center justify-around md:justify-start py-2 md:py-8 z-[110] h-16 md:h-full">
          <SidebarBtn icon={<ImageIcon />} onClick={() => { setActiveTool("image"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Type />} onClick={() => { setActiveTool("text"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Smile />} onClick={() => { setActiveTool("sticker"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Layout />} onClick={() => { setActiveTool("layout"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
        </aside>

        <main className="flex-1 flex items-center justify-center bg-[#F1F5F9] relative overflow-hidden p-4 pb-24 md:pb-4">
          <div 
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            className="shadow-2xl bg-white transition-all duration-300 ring-1 ring-black/5"
          >
            <CanvasArea key={`canvas-${currentSlide}`} elements={elements} orientation={orientation} isLocked={isLockedSlide} />
          </div>
        </main>
        

      
        {isToolPanelOpen && !isLockedSlide && currentSlide !== 4 && (
          <div className="fixed mr-2 inset-0  md:static  z-[1000] flex flex-col justify-end md:w-80 md:border-l md:bg-white">
          
            <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setIsToolPanelOpen(false)} />
            
            <div className="relative w-90 h-[70vh] md:h-full bg-white rounded-t-[2.5rem] md:rounded-none shadow-2xl md:shadow-none flex flex-col overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
                
                <div className="md:hidden   flex justify-center py-4 shrink-0">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
                
                
                <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-4  custom-scrollbar" >
                   <ToolPanel />
                </div>
            </div>
          </div>
        )}
      </div>

      {selectedId && !isLockedSlide && currentSlide !== 4 && (
        <div className="fixed inset-x-0 bottom-[64px] md:bottom-6 z-[120] flex justify-center pointer-events-none px-4">
           <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/20">
              <LayerPanel />
           </div>
        </div>
      )}
    </div>
  );
};

const SidebarBtn = ({ icon, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`p-3 sm:p-4 rounded-xl transition-all active:scale-95 ${disabled ? "opacity-20" : "text-slate-400 hover:text-blue-600"}`}
  >
    {React.cloneElement(icon, { size: 24 })}
  </button>
);

export default UserEditDesign;