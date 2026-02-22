import React, { useEffect, useRef, useState } from 'react';
import { Text as KonvaText, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditableText = ({ el, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(el.text);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isSelected && trRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  const handleSave = () => {
    onChange({ text: tempText });
    setIsEditing(false);
  };

  return (
    <>
      <KonvaText
        ref={shapeRef}
        {...el}
        id={el.id}
        visible={!(isEditing && isMobile)} // Mobile pe edit karte waqt canvas wala text chhupa do
        draggable={!isEditing}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => {
          setTempText(el.text);
          setIsEditing(true);
        }}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
      />

      {isSelected && !isEditing && (
        <Transformer ref={trRef} keepRatio={true} />
      )}

      {isEditing && (
        <Html>
          {isMobile ? (
            /* --- MOBILE VIEW: FULL MODAL --- */
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 9999, pointerEvents: 'auto'
            }}>
              <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '16px',
                width: '85%', maxWidth: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ marginBottom: '10px', fontSize: '18px', fontFamily: 'sans-serif' }}>Edit Text</h3>
                <textarea
                  autoFocus
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  style={{
                    width: '100%', height: '100px', padding: '10px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '16px', outline: 'none', marginBottom: '15px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSave} style={{ flex: 1, padding: '12px', background: '#7c3aed', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>Apply</button>
                  <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#666', borderRadius: '8px', border: 'none' }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            /* --- DESKTOP VIEW: SIMPLE OVERLAY --- */
            <textarea
              autoFocus
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSave(); }}
              style={{
                position: 'absolute',
                top: el.y - 5,
                left: el.x - 5,
                fontSize: el.fontSize + 'px',
                width: 'auto',
                minWidth: '100px',
                background: 'white',
                border: '2px solid #3b82f6',
                outline: 'none',
                padding: '4px',
                zIndex: 1000
              }}
            />
          )}
        </Html>
      )}
    </>
  );
};

export default EditableText;