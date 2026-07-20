import React, { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const ImageViewer = ({ isOpen, file, onClose }) => {
  const [scale, setScale] = useState(1);

  if (!isOpen || !file) return null;

  const url = file.cloudinaryUrl || file.downloadURL;
  const fileName = file.fileName || file.originalFileName || "image";

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 bg-luxury-charcoal/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-luxury-border shadow-2xl rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden relative"
      >
        {/* Header Toolbar */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0 text-left">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-bold text-luxury-charcoal truncate" title={file.title}>
              {file.title}
            </h3>
            <span className="text-[10px] text-gray-400 mt-0.5 block truncate max-w-[200px]">{fileName}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Zoom Actions */}
            <div className="hidden sm:flex items-center gap-2 mr-3 border-r border-gray-200 pr-3">
              <button 
                onClick={handleZoomOut} 
                className="p-1.5 text-luxury-muted hover:text-luxury-charcoal transition-all hover:bg-gray-150 rounded"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] text-luxury-muted font-mono w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={handleZoomIn} 
                className="p-1.5 text-luxury-muted hover:text-luxury-charcoal transition-all hover:bg-gray-150 rounded"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                onClick={handleResetZoom} 
                className="p-1.5 text-luxury-muted hover:text-luxury-charcoal transition-all hover:bg-gray-150 rounded"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <a
              href={url}
              download={fileName}
              className="p-1.5 text-luxury-muted hover:text-luxury-charcoal hover:bg-gray-150 rounded transition-all"
              title="Download Image"
            >
              <Download size={14} />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 bg-gray-100 hover:bg-luxury-charcoal text-luxury-muted hover:text-white rounded-full transition-all ml-1.5"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4">
          <img
            src={url}
            alt={file.title}
            className="max-w-full max-h-[62vh] object-contain rounded-lg shadow-sm transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ImageViewer;
