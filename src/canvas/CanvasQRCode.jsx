import React, { useEffect, useRef, useState } from "react";
import { Image, Transformer } from "react-konva";
import QRCode from 'qrcode';

const CanvasQRCode = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [imageNode, setImageNode] = useState(null);

  
  const getMediaType = (url) => {
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      return 'video';
    } else if (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a')) {
      return 'audio';
    }
    return 'link';
  };

  
  const getOptimizedLink = (url) => {
    const mediaType = getMediaType(url);
    
    
    if (mediaType === 'video' || mediaType === 'audio') {
      
      return url;
      
     
    }
    
    return url;
  };

  
  useEffect(() => {
    if (!el.link) return;

    const generateQRCode = async () => {
      try {
        const qrLink = getOptimizedLink(el.link);
        
       
        const qrDataUrl = await QRCode.toDataURL(qrLink, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'H', 
          color: {
            dark: '#000000',  
            light: '#ffffff'  
          }
        });

        
        const img = new window.Image();
        img.src = qrDataUrl;
        img.onload = () => {
          setImageNode(img);
        };
      } catch (error) {
        console.error("QR Code generation failed:", error);
      }
    };

    generateQRCode();
  }, [el.link]);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (!imageNode) return null;

  return (
    <>
      <Image
        image={imageNode}
        x={el.x}
        y={el.y}
        width={el.width || 150}
        height={el.height || 150}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onDragEnd={(e) => {
          onChange({
            ...el,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          onChange({
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
          });
          
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

export default CanvasQRCode;