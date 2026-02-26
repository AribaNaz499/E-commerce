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
    setAudioFile,
    videoFile,
    setVideoFile
  } = useContext(CanvasContext);

  
  console.log("LayerPannel - selectedId:", selectedId);
  console.log("LayerPannel - elements:", elements);
  console.log("LayerPannel - audioFile:", audioFile);
  console.log("LayerPannel - videoFile:", videoFile);

  
  const selectedElement = elements.find(el => el.id === selectedId) || 
                         (selectedId === audioFile?.id ? audioFile : null) ||
                         (selectedId === videoFile?.id ? videoFile : null);

  console.log("LayerPannel - selectedElement:", selectedElement);

  
  if (!selectedId || !selectedElement) {
    console.log("LayerPannel - No element selected, returning null");
    return null;
  }

  const moveElement = (direction) => {
    if (!selectedId) return;

    const index = elements.findIndex(el => el.id === selectedId);
    if (index === -1) return;

    const newElements = [...elements];

    switch(direction) {
      case 'forward':
        if (index < elements.length - 1) {
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        }
        break;
      case 'backward':
        if (index > 0) {
          [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        }
        break;
      case 'toFront':
        const frontElement = newElements.splice(index, 1)[0];
        newElements.push(frontElement);
        break;
      case 'toBack':
        const backElement = newElements.splice(index, 1)[0];
        newElements.unshift(backElement);
        break;
      default:
        return;
    }

    setElements(newElements);
  };

  const handleDelete = () => {
    if (selectedId === audioFile?.id) {
      setAudioFile(null);
    } else if (selectedId === videoFile?.id) {
      setVideoFile(null);
    } else {
      setElements(elements.filter(el => el.id !== selectedId));
    }
    setSelectedId(null);
  };

  
  let elementType = 'unknown';
  let elementIcon = '📄';
  
  if (selectedElement) {
    if (selectedElement.type === 'sticker') {
      elementType = 'sticker';
      elementIcon = '😊';
    } else if (selectedElement.type === 'image') {
      elementType = 'image';
      elementIcon = '🖼️';
    } else if (selectedElement.type === 'text') {
      elementType = 'text';
      elementIcon = '📝';
    } else if (selectedElement.type === 'qrcode') {
      elementType = 'qr code';
      elementIcon = '📱';
    } else if (selectedId === audioFile?.id) {
      elementType = 'audio';
      elementIcon = '🎵';
    } else if (selectedId === videoFile?.id) {
      elementType = 'video';
      elementIcon = '🎬';
    }
  }

  
  const getDisplayName = () => {
    if (!selectedElement) return '';
    
    if (selectedElement.name) return selectedElement.name;
    if (selectedElement.text) {
      
      return selectedElement.text.length > 15 
        ? selectedElement.text.substring(0, 15) + '...' 
        : selectedElement.text;
    }
    if (selectedElement.type === 'qrcode') return 'QR Code';
    
    return `${elementType} - ${selectedId?.slice(0, 8)}`;
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 px-4 py-3 rounded-2xl flex items-center gap-4 z-[200] animate-in fade-in zoom-in duration-200">
      
      
      <div className="flex items-center gap-2 border-r pr-4">
        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full capitalize flex items-center gap-1">
          {elementIcon} {elementType}
        </span>
        <span className="text-sm text-slate-600 max-w-[150px] truncate">
          {getDisplayName()}
        </span>
      </div>

  
      {(elementType !== 'audio' && elementType !== 'video') && (
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
      )}

      
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