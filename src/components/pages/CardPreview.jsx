import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Edit3, Loader2 } from 'lucide-react';
import { Stage, Layer, Rect, Image } from 'react-konva';
import useImage from 'use-image';
import EditableText from '../../canvas/EditableText';
import CanvasVideo from '../../canvas/CanvasVideo';
import CanvasAudioPlayer from '../../canvas/CanvasAudioPlayer';
import URLImage from '../../canvas/URLImage';
import { useCart } from '../../context/CartContext';

const Logo = ({ canvasBaseSize }) => {
    const [image] = useImage('/assets/logo.png');
    if (!image) return null;
    const size = 180;
    return (
        <Image
            image={image}
            x={(canvasBaseSize.width - size) / 2}
            y={(canvasBaseSize.height - size) / 2}
            width={size}
            height={size}
            listening={false}
        />
    );
};

const CardPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { allSlides, orientation, designName, id, price, image } = location.state || {};

    const [currentPage, setCurrentPage] = useState(1);
    const { addToCart } = useCart();
    const [isPlaying, setIsPlaying] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isCapturing, setIsCapturing] = useState(false);

    const stageRef1 = useRef(null);
    const stageRef2 = useRef(null);
    const stageRef3 = useRef(null);
    const stageRef4 = useRef(null);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!allSlides) return <div className="p-10 text-center">No design data found.</div>;

    const isMobile = windowWidth < 768;
    const canvasBaseSize = orientation === 'portrait' ? { width: 400, height: 480 } : { width: 700, height: 450 };

    const previewWidth = isMobile ? windowWidth - 48 : (orientation === 'portrait' ? 400 : 550);
    const insideWidth = isMobile ? windowWidth - 48 : (orientation === 'portrait' ? 800 : 900);
    const scale = previewWidth / canvasBaseSize.width;
    const insideScale = insideWidth / (canvasBaseSize.width * 2);
    const previewSize = { width: previewWidth, height: canvasBaseSize.height * scale };
    const insideSize = { width: insideWidth, height: canvasBaseSize.height * insideScale };

    const handleEdit = () => {
        navigate(`/design-editor/${id}`, {
            state: {
                fromPreview: true,
                slidesData: allSlides,
                orientation,
                designName,
                price, 
                image
            }
        });
    };

    const handleCart = async () => {
        if (isCapturing) return;
        setIsCapturing(true);

        try {
            await new Promise(r => setTimeout(r, 1500));

            const design1 = stageRef1.current?.toDataURL({ pixelRatio: 2 }) || '';
            const design2 = stageRef2.current?.toDataURL({ pixelRatio: 2 }) || '';
            const design3 = stageRef3.current?.toDataURL({ pixelRatio: 2 }) || '';
            const design4 = stageRef4.current?.toDataURL({ pixelRatio: 2 }) || '';

            const hasUserEdited = (
                (allSlides?.[2]?.elements?.length > 0) ||
                (allSlides?.[3]?.elements?.length > 0)
            );

            if (!design1) throw new Error("Front page capture failed");

            const cartItem = {
                id: id || `custom-${Date.now()}`,
                name: designName || 'Custom Card',
                price: parseFloat(price),
                quantity: 1,
                image: design1,
                userDesign1: design1,
                userDesign2: hasUserEdited ? design2 : '',
                userDesign3: hasUserEdited ? design3 : '',
                userDesign4: design4,
                isEdited: hasUserEdited,
            };

            console.log("Adding to cart with price:", cartItem.price); 

            addToCart(cartItem, false);
            navigate('/cart');

        } catch (err) {
            console.error("Cart Error:", err);
            alert("Error capturing designs. Please try again.");
        } finally {
            setIsCapturing(false);
        }
    };

    const RenderSlideElements = ({ slideNum }) => {
        const slide = allSlides?.[slideNum];
        if (!slide) return null;
        return (
            <Layer>
                <Rect x={0} y={0} width={canvasBaseSize.width} height={canvasBaseSize.height} fill={slide.bg || '#ffffff'} />
                {(slide.elements || []).map((el) => {
                    if (!el) return null;
                    const props = { el, isSelected: false, onChange: () => { }, draggable: false };
                    if (el.type === 'text') return <EditableText key={el.id} {...props} />;
                    if (el.type === 'image' || el.type === 'qrcode' || (el.src && !el.src.endsWith('.mp3') && !el.src.endsWith('.mp4'))) {
                        return <URLImage key={el.id} {...props} />;
                    }
                    if (el.type === 'video' || el.src?.endsWith('.mp4')) return <CanvasVideo key={el.id} {...props} />;
                    if (el.type === 'audio' || el.src?.endsWith('.mp3')) {
                        return <CanvasAudioPlayer key={el.id} {...props} audioData={el} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} />;
                    }
                    return null;
                })}
            </Layer>
        );
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center py-4 relative overflow-x-hidden">
            {isCapturing && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-bold">Capturing all pages...</p>
                </div>
            )}

            <div className="w-full max-w-6xl flex justify-between px-4 mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600">
                    <ArrowLeft size={18} /> Back
                </button>
                
                {price && (
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-blue-600">
                            ${parseFloat(price).toFixed(2)}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-xl font-bold flex items-center gap-2 border hover:bg-gray-200"
                            >
                                <Edit3 size={18} /> Edit
                            </button>
                            <button
                                onClick={handleCart}
                                disabled={isCapturing}
                                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"
                            >
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                        </div>
                    </div>
                )}
                
                {!price && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-xl font-bold flex items-center gap-2 border hover:bg-gray-200"
                        >
                            <Edit3 size={18} /> Edit
                        </button>
                        <button
                            onClick={handleCart}
                            disabled={isCapturing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"
                        >
                            <ShoppingCart size={18} /> Add to Cart
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                    <div style={{ display: currentPage === 1 ? 'block' : 'none' }}>
                        <Stage
                            width={previewSize.width}
                            height={previewSize.height}
                            scaleX={scale}
                            scaleY={scale}
                            ref={stageRef1}
                        >
                            <RenderSlideElements slideNum={1} />
                        </Stage>
                    </div>

                    <div
                        style={{ display: currentPage === 2 ? 'flex' : 'none' }}
                        className={`${isMobile ? 'flex-col gap-6' : 'flex-row gap-0 items-start justify-center'}`}
                    >
                        <div className="relative">
                            <Stage
                                width={isMobile ? previewSize.width : insideSize.width / 2}
                                height={isMobile ? previewSize.height : insideSize.height}
                                scaleX={isMobile ? scale : insideScale}
                                scaleY={isMobile ? scale : insideScale}
                                ref={stageRef2}
                            >
                                <RenderSlideElements slideNum={2} />
                            </Stage>
                        </div>

                        {!isMobile && (
                            <div
                                style={{
                                    width: '1px',
                                    height: insideSize.height,
                                    backgroundColor: '#727272',
                                    alignSelf: 'start'
                                }}
                            />
                        )}

                        <div className="relative">
                            <Stage
                                width={isMobile ? previewSize.width : insideSize.width / 2}
                                height={isMobile ? previewSize.height : insideSize.height}
                                scaleX={isMobile ? scale : insideScale}
                                scaleY={isMobile ? scale : insideScale}
                                ref={stageRef3}
                            >
                                <RenderSlideElements slideNum={3} />
                            </Stage>
                        </div>
                    </div>
                    
                    <div style={{ display: currentPage === 3 ? 'block' : 'none' }}>
                        <Stage
                            width={previewSize.width}
                            height={previewSize.height}
                            scaleX={scale}
                            scaleY={scale}
                            ref={stageRef4}
                        >
                            <RenderSlideElements slideNum={4} />
                        </Stage>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-6 flex gap-4 bg-white p-2 rounded-2xl shadow-lg border">
                {[1, 2, 3].map(num => (
                    <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`px-6 py-2 rounded-xl font-bold ${currentPage === num ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {num === 1 ? 'Front' : num === 2 ? 'Inside' : 'Back'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CardPreview;