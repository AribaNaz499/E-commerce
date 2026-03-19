import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { CanvasContext } from "../../context/CanvasContext";
import { useCart } from "../../context/CartContext";
import CanvasArea from "../../components/editor/CanvasArea";
import ToolPanel from "../../components/editor/ToolPanel";
import LayerPanel from "../../components/editor/LayerPannel";
import { ImageIcon, Type, Smile, ArrowLeft, Layout, Lock, Unlock } from "lucide-react";

const UserEditDesign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(CanvasContext);
  const { addToCart } = useCart();
  const LogoImg = "/assets/logo.png";

  if (!context)
    return <div className="h-screen flex items-center justify-center font-bold">Context Error!</div>;

  const {
    elements, setElements,
    setCanvasBg, canvasBg,
    orientation, setOrientation,
    isToolPanelOpen, setIsToolPanelOpen,
    setActiveTool, setSelectedId,
    stageRef
  } = context;

  const [fetching, setFetching] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [designName, setDesignName] = useState("");
  const [scale, setScale] = useState(1);
  const [productPrice, setProductPrice] = useState(600);
  const [productImage, setProductImage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  const [unlockedSlides, setUnlockedSlides] = useState({ 1: false, 4: false });
  const [slidesData, setSlidesData] = useState({
    1: { elements: [], bg: "#ffffff" },
    2: { elements: [], bg: "#ffffff" },
    3: { elements: [], bg: "#ffffff" },
    4: { elements: [], bg: "#ffffff" }
  });

  const isLockedSlide = (currentSlide === 1 || currentSlide === 4) && !unlockedSlides[currentSlide];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (currentSlide === 1 || currentSlide === 4) {
      const locked = !unlockedSlides[currentSlide];
      setElements(prev => prev.map(el => ({
        ...el,
        draggable: !locked,
        listening: !locked,
        isFixed: locked
      })));
    }
  }, [currentSlide, unlockedSlides]);

  const toggleLock = () => {
    setUnlockedSlides(prev => ({
      ...prev,
      [currentSlide]: !prev[currentSlide]
    }));
  };

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
        x: canvasWidth / 2 - logoSize / 2,
        y: canvasHeight / 2 - logoSize / 2,
        width: logoSize,
        height: logoSize,
        isLogo: true,
        isFixed: true,
        draggable: false,
        listening: false
      };
      slides[4] = { ...slides[4], elements: [...(slides[4]?.elements || []), logo] };
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
      return data ? { elements: data.elements || [], bg: data.bg_color || "#ffffff" } : null;
    } catch (error) {
      console.error(`Load Slide ${slideNum} Error`, error);
      return null;
    }
  };

  const saveSlideToDatabase = async (slideNum, slideElements, slideBg) => {
    if (fetching) return;
    try {
      const designId = parseInt(id);
      const { data: existingSlide } = await supabase
        .from("design_slides")
        .select("id")
        .eq("design_id", designId)
        .eq("slide_number", slideNum)
        .maybeSingle();
      const slideData = { design_id: designId, slide_number: slideNum, elements: slideElements, bg_color: slideBg, updated_at: new Date() };
      if (existingSlide) {
        await supabase.from("design_slides").update(slideData).eq("id", existingSlide.id);
      } else {
        await supabase.from("design_slides").insert([slideData]);
      }
    } catch (e) {
      console.error(`Save Error Slide ${slideNum}`, e);
    }
  };

  const handlePreview = () => {
    setSelectedId(null);
    setTimeout(() => {
      try {
        const updatedSlides = {
          ...slidesData,
          [currentSlide]: { ...slidesData[currentSlide], elements: [...elements], bg: canvasBg }
        };
        navigate("/card-preview", {
          state: { allSlides: updatedSlides, orientation, designName, id, price: productPrice, image: productImage }
        });
      } catch (error) {
        console.error("Preview error:", error);
      }
    }, 150);
  };

  const handleAddToCart = async () => {
    try {
      let canvasImage = null;
      if (stageRef?.current) canvasImage = stageRef.current.toDataURL();
      const cartItem = {
        id: `${id}-edited-${Date.now()}`,
        name: designName || "Custom Design",
        price: productPrice,
        quantity: 1,
        image: canvasImage || productImage,
        userDesign1: canvasImage || productImage,
        userDesign2: '', userDesign3: '', userDesign4: '',
        isEdited: true,
        designData: { slides: slidesData, orientation, currentSlide }
      };
      addToCart(cartItem);
      navigate('/cart');
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add design to cart");
    }
  };

  useEffect(() => {
    const loadDesign = async () => {
      if (!id) return;
      setFetching(true);
      try {
        if (location.state?.fromPreview && location.state?.slidesData) {
          const previewSlides = location.state.slidesData;
          const detectedOrientation = location.state.orientation || orientation;
          setOrientation(detectedOrientation);
          setDesignName(location.state.designName || "Untitled");
          setProductPrice(location.state.price || 600);
          setProductImage(location.state.image || "");
          setSlidesData(previewSlides);
          setElements([...previewSlides[1].elements]);
          setCanvasBg(previewSlides[1].bg);
          setCurrentSlide(1);
          setFetching(false);
          return;
        }
        const { data: product, error: productError } = await supabase
          .from("products").select("*").eq("id", id).single();
        if (productError) throw productError;
        setProductPrice(parseFloat(product.price) || 60);
        setProductImage(product.image_url || "");
        let detectedOrientation = "portrait";
        if (product.orientation === "landscape" || product.orientation === "portrait") {
          detectedOrientation = product.orientation;
        } else if (product.content?.elements?.length) {
          const hasWide = product.content.elements.some(el => (el.width || 0) > 450 || (el.x || 0) > 450);
          detectedOrientation = hasWide ? "landscape" : "portrait";
        }
        setOrientation(detectedOrientation);
        const isFreshEdit = !location.state?.fromPreview;
        let finalSlides = {
          1: { elements: product.content?.elements || [], bg: product.content?.canvasBg || "#ffffff" },
          2: isFreshEdit ? { elements: [], bg: "#ffffff" } : (await loadSlideFromDatabase(2)) || { elements: [], bg: "#ffffff" },
          3: isFreshEdit ? { elements: [], bg: "#ffffff" } : (await loadSlideFromDatabase(3)) || { elements: [], bg: "#ffffff" },
          4: (await loadSlideFromDatabase(4)) || { elements: [], bg: "#ffffff" }
        };
        finalSlides = addFixedLogoToSlide4(finalSlides, detectedOrientation);
        setDesignName(product.name || "Untitled");
        setSlidesData(finalSlides);
        setElements([...finalSlides[1].elements]);
        setCanvasBg(finalSlides[1].bg);
        setCurrentSlide(1);
      } catch (err) {
        console.error("Load error", err);
      } finally {
        setFetching(false);
      }
    };
    loadDesign();
  }, [id, location.state?.fromPreview, location.state?.slidesData]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const sidebarWidth = width >= 640 ? 64 : 0;
      const panelWidth = (isToolPanelOpen && width >= 640) ? 280 : 0;
      const availableWidth = width - sidebarWidth - panelWidth - 32;
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
        setSlidesData(prev => ({ ...prev, [currentSlide]: { elements: [...elements], bg: canvasBg } }));
        saveSlideToDatabase(currentSlide, elements, canvasBg);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [elements, canvasBg, fetching, currentSlide]);

  const handleSlideChange = async (nextSlide) => {
    if (nextSlide === currentSlide || fetching) return;
    await saveSlideToDatabase(currentSlide, elements, canvasBg);
    const nextData = slidesData[nextSlide] || { elements: [], bg: "#ffffff" };
    const nextLocked = (nextSlide === 1 || nextSlide === 4) && !unlockedSlides[nextSlide];
    setElements((nextData.elements || []).map(el => ({
      ...el,
      draggable: !nextLocked,
      listening: !nextLocked,
      isFixed: nextLocked
    })));
    setCanvasBg(nextData.bg);
    setCurrentSlide(nextSlide);
    setSelectedId(null);
  };

  if (fetching) return <div className="h-screen flex items-center justify-center">Loading Design...</div>;

  const isSpecialSlide = currentSlide === 1 || currentSlide === 4;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden fixed inset-0 select-none">

      <nav className="h-12 sm:h-14 md:h-16 bg-white border-b px-2 sm:px-4 flex items-center justify-between z-[100] shrink-0 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-blue-600 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-xl shadow-inner">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => handleSlideChange(num)}
                className={`relative transition-all rounded-lg flex items-center justify-center font-black mx-0.5
                  ${currentSlide === num ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"}
                  ${orientation === 'landscape'
                    ? "w-8 h-6 sm:w-10 sm:h-7 md:w-14 md:h-10"
                    : "w-7 h-9 sm:w-8 sm:h-10 md:w-12 md:h-14"}`}
              >
                <span className="text-[9px] sm:text-[10px] md:text-xs">
                  {num === 1 ? "F" : num === 4 ? "B" : num}
                </span>
                {(num === 1 || num === 4) && !unlockedSlides[num] && (
                  <Lock size={7} className="absolute top-0 right-0 m-0.5 text-slate-400" />
                )}
              </button>
            ))}
          </div>

          {isSpecialSlide && (
            <button
              onClick={toggleLock}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all border ${
                isLockedSlide
                  ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                  : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
              }`}
            >
              {isLockedSlide
                ? <><Lock size={11} /> <span className="hidden sm:inline">Locked</span></>
                : <><Unlock size={11} /> <span className="hidden sm:inline">Unlocked</span></>
              }
            </button>
          )}
        </div>

        <button onClick={handlePreview} className="bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wide">
          Preview
        </button>
      </nav>

      
      <div className="flex-1 flex overflow-hidden relative">

        
        <aside className="hidden sm:flex w-14 sm:w-16 md:w-20 bg-white border-r flex-col items-center py-3 sm:py-4 space-y-3 sm:space-y-4 shrink-0">
          <SidebarBtn icon={<ImageIcon />} onClick={() => { setActiveTool("image"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Type />} onClick={() => { setActiveTool("text"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Smile />} onClick={() => { setActiveTool("sticker"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Layout />} onClick={() => { setActiveTool("layout"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
        </aside>

        <main className="flex-1 flex items-center justify-center bg-[#F1F5F9] relative overflow-hidden p-2 sm:p-4">
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }} className="shadow-2xl bg-white ring-1 ring-black/5">
            <CanvasArea key={`canvas-${currentSlide}`} elements={elements} orientation={orientation} isLocked={isLockedSlide} />
          </div>

          {isToolPanelOpen && !isLockedSlide && !isMobile && (
            <div className="absolute right-0 top-0 h-full w-64 sm:w-72 md:w-80 bg-white shadow-lg z-50 overflow-y-auto">
              <ToolPanel />
            </div>
          )}

          {elements.length > 0 && !isLockedSlide && (
            <div className="absolute bottom-0 left-0 right-0 sm:left-auto sm:right-0 flex justify-center sm:justify-end z-40">
              <LayerPanel />
            </div>
          )}
        </main>

        {isToolPanelOpen && !isLockedSlide && isMobile && (
          <>
            <div className="absolute inset-0 bg-black/30 z-[60]" onClick={() => setIsToolPanelOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-center px-4 pt-3 pb-2 sticky top-0 bg-white z-10">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>
              <ToolPanel />
            </div>
          </>
        )}
      </div>

      <div className="sm:hidden flex items-center justify-around bg-white border-t px-2 py-2 shrink-0 z-[90]">
        <MobileBtn icon={<ImageIcon size={20} />} label="Image" onClick={() => { setActiveTool("image"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
        <MobileBtn icon={<Type size={20} />} label="Text" onClick={() => { setActiveTool("text"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
        <MobileBtn icon={<Smile size={20} />} label="Sticker" onClick={() => { setActiveTool("sticker"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
        <MobileBtn icon={<Layout size={20} />} label="Layout" onClick={() => { setActiveTool("layout"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
      </div>

    </div>
  );
};

const SidebarBtn = ({ icon, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className={`p-2 sm:p-3 rounded-xl transition-all active:scale-95 ${disabled ? "opacity-20 cursor-not-allowed" : "text-slate-400 hover:text-blue-600 hover:bg-slate-50"}`}>
    {React.cloneElement(icon, { size: 22 })}
  </button>
);

const MobileBtn = ({ icon, label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all active:scale-95 ${disabled ? "opacity-20 cursor-not-allowed" : "text-slate-400 hover:text-blue-600"}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default UserEditDesign;