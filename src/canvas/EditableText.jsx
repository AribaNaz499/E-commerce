import React, { useEffect, useRef, useState } from 'react';
import { Text as KonvaText, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditableText = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(el.text);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  useEffect(() => {
    setTempText(el.text);
  }, [el.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempText.trim() !== '') {
      onChange({
        ...el,
        text: tempText
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempText(el.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDoubleClick = (e) => {
    e.cancelBubble = true;
    setTempText(el.text);
    setIsEditing(true);
  };

  return (
    <>
      <KonvaText
        ref={shapeRef}
        {...el}
        id={el.id}
        text={el.text}
        draggable={!isEditing}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}  
        onDragEnd={(e) => {
          onChange({
            ...el,
            x: e.target.x(),
            y: e.target.y()
          });
        }}
      />

      {isSelected && !isEditing && (
        <Transformer 
          ref={trRef} 
          keepRatio={true}
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
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            <textarea
              ref={textareaRef}
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              style={{
                position: 'absolute',
                left: el.x - 5,
                top: el.y - 5,
                width: 'auto',
                minWidth: '200px',
                maxWidth: 'min(400px, 80vw)',
                minHeight: '60px',
                fontSize: `${el.fontSize || 40}px`,
                fontFamily: el.fontFamily || 'Arial',
                color: el.fill || '#000000',
                background: 'white',
                border: '3px solid #7c3aed',
                borderRadius: '8px',
                outline: 'none',
                padding: '12px',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)',
                resize: 'both',
                overflow: 'auto',
                lineHeight: '1.4',
                pointerEvents: 'auto',
                zIndex: 10000,
                WebkitAppearance: 'none',
                appearance: 'none',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)'
              }}
            />
          </div>
        </Html>
      )}
    </>
  );
};

export default EditableText;