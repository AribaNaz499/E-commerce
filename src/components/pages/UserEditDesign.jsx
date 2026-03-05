import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../../supabase/client";
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
  const context = useContext(CanvasContext);

  if (!context)
    return <div className="h-screen flex items-center justify-center font-bold">Context Error!</div>;

  const {
    elements, setElements,
    setCanvasBg, canvasBg,
    orientation, setOrientation,
    activeTool, setActiveTool,
    isToolPanelOpen, setIsToolPanelOpen,
    addText, addSticker, handleImageUpload,
    imageInputRef, setSelectedId,
    selectedId
  } = context;

  const [fetching, setFetching] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [designName, setDesignName] = useState("");
  const [scale, setScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const canvasDimensions = {
    portrait: { width: 400, height: 550 },
    landscape: { width: 700, height: 450 }
  };

  const [slidesData, setSlidesData] = useState({
    1: { elements: [], bg: "#ffffff" },
    2: { elements: [], bg: "#ffffff" },
    3: { elements: [], bg: "#ffffff" },
    4: { elements: [], bg: "#ffffff" }
  });

  const isLockedSlide = currentSlide === 1; 


  useEffect(() => {

    const handleResize = () => {

      const width = window.innerWidth;

      const sidebarWidth = width >= 768 ? 80 : 0;
      const panelWidth = (isToolPanelOpen && width >= 768) ? 320 : 0;

      const availableWidth = width - sidebarWidth - panelWidth - 60;

      const baseWidth = orientation === "landscape" ? 700 : 400;

      const newScale = Math.min(availableWidth / baseWidth, 0.9);

      setScale(newScale);

    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, [orientation, isToolPanelOpen]);

  
  const saveSlideToDatabase = async (slideNum, slideElements, slideBg) => {
    try {
      const designId = parseInt(id);
      
      const { data: existingSlide, error: checkError } = await supabase
        .from("design_slides")
        .select("id")
        .eq("design_id", designId)
        .eq("slide_number", slideNum)
        .maybeSingle();

      if (checkError) throw checkError;

      const slideData = {
        design_id: designId,
        slide_number: slideNum,
        elements: slideElements || [],
        bg_color: slideBg || "#ffffff",
        updated_at: new Date()
      };

      if (existingSlide) {
        const { error } = await supabase
          .from("design_slides")
          .update({
            elements: slideElements || [],
            bg_color: slideBg || "#ffffff",
            updated_at: new Date()
          })
          .eq("design_id", designId)
          .eq("slide_number", slideNum);

        if (error) throw error;
        console.log(`✅ Updated slide ${slideNum} in design_slides`);
      } else {
        const { error } = await supabase
          .from("design_slides")
          .insert([slideData]);

        if (error) throw error;
        console.log(`✅ Inserted slide ${slideNum} into design_slides`);
      }
    } catch (error) {
      console.error(`❌ Error saving slide ${slideNum}:`, error);
    }
  };

  const loadSlidesFromDatabase = async () => {
    try {
      const designId = parseInt(id);
      
      const { data: slides, error } = await supabase
        .from("design_slides")
        .select("*")
        .eq("design_id", designId);

      if (error) throw error;

      const loadedSlides = {
        1: { elements: [], bg: "#ffffff" },
        2: { elements: [], bg: "#ffffff" },
        3: { elements: [], bg: "#ffffff" },
        4: { elements: [], bg: "#ffffff" }
      };

      slides?.forEach(slide => {
        loadedSlides[slide.slide_number] = {
          elements: slide.elements || [],
          bg: slide.bg_color || "#ffffff"
        };
      });

      console.log("📦 Loaded slides from design_slides:", loadedSlides);
      return loadedSlides;
    } catch (error) {
      console.error("❌ Error loading slides:", error);
      return null;
    }
  };

  const addFixedLogoToSlide4 = (slides) => {
    const currentOrientation = orientation || "portrait";
    
    const canvasWidth = currentOrientation === "landscape" ? 700 : 400;
    const canvasHeight = currentOrientation === "landscape" ? 450 : 550;
    
    const logoWidth = currentOrientation === "landscape" ? 180 : 150;
    const logoHeight = currentOrientation === "landscape" ? 180 : 150;
    
    const hasLogo = slides[4]?.elements?.some(el => el.isLogo === true);
    
    if (!hasLogo) {
      
      const logo = {
        id: `logo-${Date.now()}`,
        type: "image",
        src: LogoImg, 
        x: (canvasWidth / 2) - (logoWidth / 2), 
        y: (canvasHeight / 2) - (logoHeight / 2), 
        width: logoWidth,
        height: logoHeight,
        isLogo: true,
        isFixed: true,
        draggable: false,
        listening: false,
        perfectDrawEnabled: false
      };
      
      slides[4] = {
        ...slides[4],
        elements: [...(slides[4]?.elements || []), logo]
      };
      
      console.log(`✅ Fixed logo added to Slide 4 (${currentOrientation} mode)`);
      console.log(`📐 Position: x=${logo.x}, y=${logo.y}, size=${logoWidth}x${logoHeight}`);
    }
    
    return slides;
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

        if (product) {
          console.log("📦 PRODUCT DATA:", product);
          
          let loadedSlides = await loadSlidesFromDatabase();
          
          if (!loadedSlides || Object.values(loadedSlides).every(s => s.elements.length === 0)) {
            console.log("📦 No slides in design_slides, checking products.content");
            
            const dbContent = product.content || {};
            
            loadedSlides = {
              1: { elements: dbContent.elements || [], bg: dbContent.canvasBg || "#ffffff" },
              2: { elements: [], bg: "#ffffff" },
              3: { elements: [], bg: "#ffffff" },
              4: { elements: [], bg: "#ffffff" }
            };

            if (dbContent.allSlides) {
              loadedSlides = {
                ...loadedSlides,
                ...dbContent.allSlides
              };
            }
          }

          let detectedOrientation = product.orientation || "";

          if (!detectedOrientation) {
            const hasWideElement = loadedSlides[1]?.elements?.some(el => 
              el.x > 500 || (el.width && el.width > 500)
            );
            detectedOrientation = hasWideElement ? "landscape" : "portrait";
          }

          const finalOrientation = detectedOrientation === "landscape" ? "landscape" : "portrait";
          
          setOrientation(finalOrientation);

          loadedSlides = addFixedLogoToSlide4(loadedSlides);

          console.log("📦 SLIDE 1 ELEMENTS:", loadedSlides[1]?.elements?.length || 0);
          console.log("📦 SLIDE 2 ELEMENTS:", loadedSlides[2]?.elements?.length || 0);
          console.log("📦 SLIDE 3 ELEMENTS:", loadedSlides[3]?.elements?.length || 0);
          console.log("📦 SLIDE 4 ELEMENTS:", loadedSlides[4]?.elements?.length || 0);

          [1,2,3,4].forEach(num => {
            if (!loadedSlides[num]) {
              loadedSlides[num] = { elements: [], bg: "#ffffff" };
            }
            if (!loadedSlides[num].elements) {
              loadedSlides[num].elements = [];
            }
          });

          console.log("✅ FINAL ORIENTATION:", finalOrientation);
          console.log("✅ FINAL SLIDES DATA:", loadedSlides);
          
          setDesignName(product.name || "Untitled Design");
          setSlidesData(loadedSlides);
          
          setElements([...loadedSlides[1].elements]);
          setCanvasBg(loadedSlides[1].bg || "#ffffff");
        }

      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setFetching(false);
      }

    };

    loadDesign();

  }, [id]);


  useEffect(() => {
    if (!fetching && slidesData[4]?.elements) {
      const canvasWidth = orientation === "landscape" ? 700 : 400;
      const canvasHeight = orientation === "landscape" ? 450 : 550;
      const logoWidth = orientation === "landscape" ? 180 : 150;
      const logoHeight = orientation === "landscape" ? 180 : 150;
      
      
      setSlidesData(prev => {
        const updatedElements = prev[4].elements.map(el => {
          if (el.isLogo) {
            return {
              ...el,
              x: canvasWidth / 2 - logoWidth / 2,
              y: canvasHeight / 2 - logoHeight / 2,
              width: logoWidth,
              height: logoHeight
            };
          }
          return el;
        });
        
        return {
          ...prev,
          4: {
            ...prev[4],
            elements: updatedElements
          }
        };
      });

      if (currentSlide === 4) {
        setElements(prev => prev.map(el => {
          if (el.isLogo) {
            return {
              ...el,
              x: canvasWidth / 2 - logoWidth / 2,
              y: canvasHeight / 2 - logoHeight / 2,
              width: logoWidth,
              height: logoHeight
            };
          }
          return el;
        }));
      }
    }
  }, [orientation, fetching, currentSlide]);

  const saveCurrentSlideData = () => {
    setSlidesData(prev => {
      const updated = {
        ...prev,
        [currentSlide]: { 
          elements: elements ? [...elements] : [], 
          bg: canvasBg 
        }
      };
      console.log(`💾 Saved slide ${currentSlide} to memory:`, {
        elementsCount: updated[currentSlide].elements.length
      });
      return updated;
    });
  };

  
  useEffect(() => {
    if (!fetching && !isLockedSlide && elements) {
      const timer = setTimeout(async () => {
        saveCurrentSlideData();
        await saveSlideToDatabase(currentSlide, elements, canvasBg);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [elements, canvasBg, currentSlide, fetching, isLockedSlide]);

  useEffect(() => {
    if (isLockedSlide && selectedId) {
      setSelectedId(null);
    }
  }, [isLockedSlide, selectedId]);

  

  const handleSlideChange = async (nextSlide) => {
    if (nextSlide === currentSlide) return;

    console.log("➡️ Slide change from", currentSlide, "to", nextSlide);

    await saveSlideToDatabase(currentSlide, elements, canvasBg);
    saveCurrentSlideData();

    let nextData = slidesData[nextSlide] || { elements: [], bg: "#ffffff" };

    console.log(`📂 Loading slide ${nextSlide} with ${nextData.elements?.length || 0} elements`);

  
    const processedElements = (nextData.elements || []).map(el => {
      if (nextSlide === 4 || nextSlide === 1) {
        return {
          ...el,
          draggable: false,
          isFixed: true,
          listening: false,
          hitStrokeWidth: 0
        };
      } else {
        return {
          ...el,
          draggable: true,
          isFixed: false,
          listening: true,
          hitStrokeWidth: 2
        };
      }
    });

    setElements(processedElements);
    setCanvasBg(nextData.bg || "#ffffff");
    setCurrentSlide(nextSlide);
    setSelectedId(null);
    setIsToolPanelOpen(false);
  };



  const handlePreview = async () => {
    await saveSlideToDatabase(currentSlide, elements, canvasBg);
    saveCurrentSlideData();

    const finalSlidesData = {
      ...slidesData,
      [currentSlide]: { elements: [...elements], bg: canvasBg }
    };

    navigate("/card-preview", {
      state: {
        allSlides: finalSlidesData,
        orientation,
        designName
      }
    });
  };

  
  const handleBack = async () => {
    setIsSaving(true);
    
    await saveSlideToDatabase(currentSlide, elements, canvasBg);
    
    for (let slideNum = 1; slideNum <= 4; slideNum++) {
      if (slideNum !== currentSlide && slidesData[slideNum]?.elements?.length > 0) {
        await saveSlideToDatabase(slideNum, slidesData[slideNum].elements, slidesData[slideNum].bg);
      }
    }
    
    setIsSaving(false);
    navigate(-1);
  };

  if (fetching)
    return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const currentSize = canvasDimensions[orientation] || canvasDimensions.portrait;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
   
      <nav className="h-16 bg-white border-b px-4 flex items-center justify-between">
        <button 
          onClick={handleBack} 
          className="text-slate-500 hover:text-blue-600 flex items-center gap-1"
          disabled={isSaving}
        >
          <ArrowLeft size={20} />
          {isSaving ? "Saving..." : "Back"}
        </button>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[1,2,3,4].map(num => (
            <button
              key={num}
              onClick={() => handleSlideChange(num)}
              className={`w-12 h-12 rounded-lg text-sm font-black relative ${
                currentSlide === num
                  ? "bg-blue-600 text-white"
                  : "text-slate-500"
              }`}
            >
              {num === 1 ? "F" : num === 4 ? "B" : num}
              {(num === 1 || num === 4) && (
                <Lock size={12} className="absolute -top-1 -right-1 text-slate-400" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handlePreview}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase"
          disabled={isSaving}
        >
          Preview
        </button>
      </nav>

    
      <div className="flex-1 flex overflow-hidden">
      
        <aside className="w-20 bg-white border-r flex flex-col items-center py-8 gap-8">
          <SidebarBtn 
            icon={<ImageIcon />} 
            onClick={() => { 
              if (!isLockedSlide && currentSlide !== 4) {
                setActiveTool("image"); 
                setIsToolPanelOpen(true);
              }
            }} 
            disabled={isLockedSlide || currentSlide === 4 || isSaving}
          />
          <SidebarBtn 
            icon={<Type />} 
            onClick={() => { 
              if (!isLockedSlide && currentSlide !== 4) {
                setActiveTool("text"); 
                setIsToolPanelOpen(true);
              }
            }} 
            disabled={isLockedSlide || currentSlide === 4 || isSaving}
          />
          <SidebarBtn 
            icon={<Smile />} 
            onClick={() => { 
              if (!isLockedSlide && currentSlide !== 4) {
                setActiveTool("sticker"); 
                setIsToolPanelOpen(true);
              }
            }} 
            disabled={isLockedSlide || currentSlide === 4 || isSaving}
          />
          <SidebarBtn 
            icon={<Layout />} 
            onClick={() => { 
              if (!isLockedSlide && currentSlide !== 4) {
                setActiveTool("layout"); 
                setIsToolPanelOpen(true);
              }
            }} 
            disabled={isLockedSlide || currentSlide === 4 || isSaving}
          />

          {(isLockedSlide || currentSlide === 4) && (
            <div className="text-xs text-slate-400 text-center px-2 mt-4">
              <Lock size={16} className="mx-auto mb-1" />
              <span>{currentSlide === 4 ? "Fixed Logo" : "Slide Locked"}</span>
            </div>
          )}
        </aside>

        
        <main className="flex-1 flex items-center justify-center bg-[#F1F5F9] relative">
          <div style={{ transform:`scale(${scale})` }}>
            <CanvasArea
              key={`canvas-${orientation}-${currentSlide}`}
              elements={elements}
              orientation={orientation}
            />
          </div>
        </main>

        {isToolPanelOpen && !isLockedSlide && currentSlide !== 4 && (
          <ToolPanel />
        )}
      </div>

    
      {selectedId && !isLockedSlide && currentSlide !== 4 && (
        <LayerPanel />
      )}
    </div>
  );
};

const SidebarBtn = ({ icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-xl transition-all ${
      disabled
        ? "opacity-30 cursor-not-allowed"
        : "text-slate-400 hover:bg-slate-100 hover:text-blue-600"
    }`}
  >
    {React.cloneElement(icon, { size: 24 })}
  </button>
);

export default UserEditDesign;