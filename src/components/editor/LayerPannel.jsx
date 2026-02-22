
import React, { useContext } from 'react';
import { Trash2, MoveUp, MoveDown, ChevronUp, ChevronDown } from 'lucide-react';
import { CanvasContext } from '../../context/CanvasContext.jsx';
const LayerPannel = () => {
  const { 
    selectedId, 
    setSelectedId, 
    elements, 
    setElements,
    audioFile,
    setAudioFile
  } = useContext(CanvasContext);

  if (!selectedId) return null;

  
  const moveElement = (direction) => {
    if (!selectedId) return;
    
    const index = elements.findIndex(el => el.id === selectedId);
    if (index === -1) return;
    
    const newElements = [...elements];
    
    if (direction === 'forward' && index < elements.length - 1) {
      
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    } else if (direction === 'backward' && index > 0) {
      
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    } else if (direction === 'toFront') {

        const element = newElements.splice(index, 1)[0];
      newElements.push(element);
    } else if (direction === 'toBack') {

        const element = newElements.splice(index, 1)[0];
      newElements.unshift(element);
    }
    
    setElements(newElements);
  };

  const handleDelete = () => {
    if (selectedId === audioFile?.id) {
      setAudioFile(null);
    } else {
      setElements(elements.filter(el => el.id !== selectedId));
    }
    setSelectedId(null);
  };

  
  const selectedElement = elements.find(el => el.id === selectedId) || 
                         (selectedId === audioFile?.id ? audioFile : null);
  
  const elementType = selectedElement?.type || (selectedId === audioFile?.id ? 'audio' : 'unknown');

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 px-4 py-3 rounded-2xl flex items-center gap-4 z-[200] animate-in fade-in zoom-in duration-200">
      
      
      <div className="flex items-center gap-2 border-r pr-4">
        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {elementType}
        </span>
        <span className="text-sm text-slate-600 max-w-[150px] truncate">
          {selectedElement?.name || selectedElement?.text || selectedId?.slice(0, 8)}
        </span>
      </div>
      
    
      <div className="flex border-r pr-3 gap-1">
        <button
          onClick={() => moveElement('toFront')}
          className="p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
          title="Bring to Front"
        >
          <MoveUp size={18} />
        </button>

        <button
          onClick={() => moveElement('forward')}
          className="p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
          title="Bring Forward"
        >
          <ChevronUp size={18} />
        </button>

        <button
          onClick={() => moveElement('backward')}
          className="p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
          title="Send Backward"
        >
          <ChevronDown size={18} />
        </button>

        <button
          onClick={() => moveElement('toBack')}
          className="p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
          title="Send to Back"
        >
          <MoveDown size={18} />
        </button>
      </div>

      
      <button
        onClick={handleDelete}
        className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white active:scale-95 transition-all duration-150"
        title="Delete Element"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default LayerPannel;