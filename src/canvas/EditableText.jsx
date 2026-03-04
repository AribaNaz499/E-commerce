import React, { useEffect, useRef, useState } from 'react';
import { Text as KonvaText, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditableText = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(el.text);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  const handleDblClick = (e) => {
    e.cancelBubble = true;
    const stage = shapeRef.current.getStage();
    const textPosition = shapeRef.current.absolutePosition();
    
    setEditPosition({
      x: textPosition.x,
      y: textPosition.y,
    });
    
    setText(el.text);
    setIsEditing(true);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onChange({ text: text });
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(el.text);
    }
  };

  const handleBlur = () => {
    onChange({ text: text });
    setIsEditing(false);
  };

  const handleTouchEnd = (e) => {
    if (!isEditing) {
      onSelect();
    }
  };

  return (
    <>
      <KonvaText
        ref={shapeRef}
        {...el}
        text={el.text}
        id={el.id}
        draggable={!isEditing}
        onClick={onSelect}
        onTap={handleTouchEnd}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
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
            fontSize: Math.max(8, el.fontSize * scaleX),
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
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}

      {isEditing && (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
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
                fontSize: `${el.fontSize}px`,
                fontFamily: el.fontFamily || 'Arial',
                color: el.fill,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '2px 4px',
                margin: '0',
                minWidth: '100px',
                minHeight: `${el.fontSize + 10}px`,
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