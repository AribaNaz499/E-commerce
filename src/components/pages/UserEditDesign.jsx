import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { CanvasContext } from "../../context/CanvasContext";
import { useCart } from "../../context/CartContext";
import CanvasArea from "../../components/editor/CanvasArea";
import ToolPanel from "../../components/editor/ToolPanel";
import LayerPanel from "../../components/editor/LayerPannel";
import { ImageIcon, Type, Smile, ArrowLeft, Layout, Lock } from "lucide-react";

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
  const [slidesData, setSlidesData] = useState({
    1: { elements: [], bg: "#ffffff" },
    2: { elements: [], bg: "#ffffff" },
    3: { elements: [], bg: "#ffffff" },
    4: { elements: [], bg: "#ffffff" }
  });

  const isLockedSlide = currentSlide === 1 || currentSlide === 4;

  useEffect(() => {
    if (isLockedSlide) {
      setElements(prev => prev.map(el => ({ ...el, draggable: false, listening: false, isFixed: true })));
    }
  }, [currentSlide]);

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
          [currentSlide]: {
            ...slidesData[currentSlide],
            elements: [...elements],
            bg: canvasBg,
          }
        };

        navigate("/card-preview", {
          state: {
            allSlides: updatedSlides,
            orientation,
            designName,
            id,
            price: productPrice, 
            image: productImage
          }
        });
      } catch (error) {
        console.error("Preview error:", error);
      }
    }, 150);
  };

  const handleAddToCart = async () => {
    try {
      let canvasImage = null;
      if (stageRef?.current) {
        canvasImage = stageRef.current.toDataURL();
      }

      const cartItem = {
        id: `${id}-edited-${Date.now()}`, // Unique ID for edited item
        name: designName || "Custom Design",
        price: productPrice, 
        quantity: 1,
        image: canvasImage || productImage,
        userDesign1: canvasImage || productImage,
        userDesign2: '',
        userDesign3: '',
        userDesign4: '',
        isEdited: true,
        designData: {
          slides: slidesData,
          orientation: orientation,
          currentSlide: currentSlide
        }
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
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (productError) throw productError;

        setProductPrice(parseFloat(product.price) || 600);
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
    const isLocked = nextSlide === 1 || nextSlide === 4;
    setElements((nextData.elements || []).map(el => ({ ...el, draggable: !isLocked, listening: !isLocked, isFixed: isLocked })));
    setCanvasBg(nextData.bg);
    setCurrentSlide(nextSlide);
    setSelectedId(null);
  };

  if (fetching) return <div className="h-screen flex items-center justify-center">Loading Design...</div>;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden fixed inset-0 select-none">

      <nav className="h-14 sm:h-16 bg-white border-b px-2 sm:px-4 flex items-center justify-between z-[100] shrink-0 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-blue-600 p-2">
          <ArrowLeft size={20} />
        </button>

        <div className="flex bg-slate-100 p-0 rounded-xl shadow-inner">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => handleSlideChange(num)}
              className={`relative transition-all rounded-lg flex items-center justify-center font-black mx-0.5
                ${currentSlide === num ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"}
                ${orientation === 'landscape' ? "w-10 h-7 sm:w-14 sm:h-10" : "w-8 h-10 sm:w-12 sm:h-14"}`}
            >
              <span className="text-[10px] sm:text-xs">{num === 1 ? "F" : num === 4 ? "B" : num}</span>
              {(num === 1 || num === 4) && <Lock size={10} className="absolute top-0 right-0 m-0.5 text-slate-400" />}
            </button>
          ))}
        </div>

        <button onClick={handlePreview} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase">
          Preview
        </button>
      </nav>

      <div className="flex-1 flex overflow-hidden">

        <aside className="w-20 bg-white border-r flex flex-col items-center py-4 space-y-4">
          <SidebarBtn icon={<ImageIcon />} onClick={() => { setActiveTool("image"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Type />} onClick={() => { setActiveTool("text"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Smile />} onClick={() => { setActiveTool("sticker"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
          <SidebarBtn icon={<Layout />} onClick={() => { setActiveTool("layout"); setIsToolPanelOpen(true); }} disabled={isLockedSlide} />
        </aside>

        <main className="flex-1 flex items-center justify-center bg-[#F1F5F9] p-4 relative">
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            className="shadow-2xl bg-white ring-1 ring-black/5">
            <CanvasArea key={`canvas-${currentSlide}`} elements={elements} orientation={orientation} isLocked={isLockedSlide} />
          </div>

          {isToolPanelOpen && !isLockedSlide && (
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg z-50">
              <ToolPanel />
            </div>
          )}

          {elements.length > 0 && !isLockedSlide && (
            <div className="absolute left-0 bottom-0 w-full md:w-auto md:right-0 md:top-auto md:bottom-0 flex justify-center z-50">
              <LayerPanel />
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

const SidebarBtn = ({ icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-xl transition-all active:scale-95 ${disabled ? "opacity-20" : "text-slate-400 hover:text-blue-600"}`}
  >
    {React.cloneElement(icon, { size: 24 })}
  </button>
);

export default UserEditDesign;