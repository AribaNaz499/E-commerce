import React, { useEffect, useRef, useState } from 'react';
import { Text as KonvaText, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditableText = ({ el, isSelected, onSelect, onChange, draggable = true }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(el.text);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setText(el.text);
  }, [el.text]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  const handleDblClick = (e) => {
    e.cancelBubble = true;
    const textPosition = shapeRef.current.absolutePosition();
    setEditPosition({ x: textPosition.x, y: textPosition.y });
    setText(el.text);
    setIsEditing(true);
  };

  const handleTextChange = (e) => setText(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onChange({ text });
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(el.text);
    }
  };

  const handleBlur = () => {
    onChange({ text });
    setIsEditing(false);
  };

  const handleTouchEnd = () => {
    if (!isEditing) onSelect?.();
  };

  return (
    <>
     <KonvaText
  ref={shapeRef}
  {...el}
  text={el.text}
  id={el.id}
  draggable={draggable && !isEditing && !el.isFixed}
  listening={!el.isFixed}
  onClick={onSelect}
  width={el.width || 300} 
  align={el.align || "left"} 
  onTap={handleTouchEnd}
  onDblClick={handleDblClick}
  onDblTap={handleDblClick}
  onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
  onTransformEnd={() => {
    const node = shapeRef.current;
    const scaleX = node.scaleX(); 

    
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      
      width: Math.max(5, node.width() * scaleX), 
      fontSize: Math.max(8, (el.fontSize || 16) * scaleX),
    });
  }}
/>

      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}

      {isEditing && (
        <Html>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <textarea
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
              style={{
                position: 'absolute',
                top: editPosition.y - 2,
                left: editPosition.x - 2,
                fontSize: `${el.fontSize || 16}px`,
                fontFamily: el.fontFamily || 'Arial',
                color: el.fill || '#000000',
                fontWeight: el.fontStyle === 'bold' ? 'bold' : 'normal',
                fontStyle: el.fontStyle === 'italic' ? 'italic' : 'normal',
                textDecoration: el.textDecoration || 'none',
                textAlign: el.align || 'left',
                lineHeight: el.lineHeight || 1.2,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '2px 4px',
                margin: '0',
                minWidth: '100px',
                minHeight: `${(el.fontSize || 16) + 10}px`,
                outline: 'none',
                resize: 'both',
                overflow: 'hidden',
                zIndex: 1000,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                pointerEvents: 'auto',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            />
          </div>
        </Html>
      )}
    </>
  );
};

export default EditableText;