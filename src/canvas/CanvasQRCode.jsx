import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer, Group, Rect } from 'react-konva';
import { QRCodeCanvas } from 'qrcode.react';
import { createPortal } from 'react-dom';

const CanvasQRCode = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    const generateQR = () => {
      const canvas = document.getElementById(`hidden-qr-${el.id}`);
      if (canvas && canvas instanceof HTMLCanvasElement) {
        const img = new window.Image();
        img.src = canvas.toDataURL();
        img.onload = () => setQrImage(img);
      }
    };
    const timer = setTimeout(generateQR, 500);
    return () => clearTimeout(timer);
  }, [el.link, el.id]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {/* ⚠️ YEH HISSA STAGE SE BAHAR JAYEGA (NO MORE ERRORS) */}
      {createPortal(
        <div style={{ position: 'absolute', top: -5000, left: -5000, opacity: 0 }}>
          <QRCodeCanvas id={`hidden-qr-${el.id}`} value={el.link || ""} size={256} />
        </div>,
        document.body
      )}

      {/* KONVA SIRF TASVEER DIKHAYEGA */}
      <Group
        ref={shapeRef}
        x={el.x}
        y={el.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
      >
        {qrImage ? (
          <Image image={qrImage} width={el.width || 120} height={el.height || 120} />
        ) : (
          <Rect width={120} height={120} fill="#f3f4f6" stroke="#ccc" />
        )}
      </Group>

      {isSelected && (
        <Transformer ref={trRef} rotateEnabled={false} keepRatio={true} />
      )}
    </>
  );
};

export default CanvasQRCode;