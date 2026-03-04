import React, { useEffect, useRef, useState } from "react";
import { Image } from "react-konva";
import QRCode from "qrcode";

const CanvasQRCode = ({ el, onSelect, onChange }) => {
  const shapeRef = useRef();
  const [imageNode, setImageNode] = useState(null);

  useEffect(() => {
    if (!el.link) return;

    QRCode.toDataURL(el.link, { width: 300, margin: 2 })
      .then((dataUrl) => {
        const img = new window.Image();
        img.src = dataUrl;
        img.onload = () => {
          setImageNode(img);
        };
      })
      .catch((err) => {
        console.error("QR generation error:", err);
      });
  }, [el.link]);

  if (!imageNode) return null;

  return (
    <Image
      id={el.id}
      ref={shapeRef}
      image={imageNode}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
        });
      }}
    />
  );
};

export default CanvasQRCode;