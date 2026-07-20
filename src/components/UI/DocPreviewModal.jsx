import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DocPreviewModal = ({ isOpen, item, onClose }) => {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state when file changes
    setScale(1);
    setLoading(true);
  }, [item]);

  if (!isOpen || !item) return null;

  const ext = item.originalFileName.split(".").pop().toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext);
  const isPdf = ext === "pdf";

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-luxury-charcoal/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white border border-luxury-border shadow-2xl rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative"
        >
          {/* Header Toolbar */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-luxury-charcoal truncate" title={item.title}>
                  {item.title}
                </h3>
                <span className="bg-luxury-sand text-luxury-charcoal px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-luxury-border/30 shrink-0">
                  {item.category}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.originalFileName}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Image specific zoom controls */}
              {isImage && (
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
              )}

              {/* General Actions */}
              <a
                href={item.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-luxury-muted hover:text-luxury-charcoal hover:bg-gray-150 rounded transition-all flex items-center gap-1 text-xs"
                title="Open in new tab"
              >
                <ExternalLink size={14} />
              </a>
              
              <a
                href={item.downloadURL}
                download={item.originalFileName}
                className="p-1.5 text-luxury-muted hover:text-luxury-charcoal hover:bg-gray-150 rounded transition-all"
                title="Download"
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

          {/* Viewer Area */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4 relative">
            {loading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-luxury-accent" size={32} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-luxury-muted">
                    Loading preview...
                  </span>
                </div>
              </div>
            )}

            {isPdf && (
              <iframe
                src={`${item.downloadURL}#toolbar=1`}
                className="w-full h-full border-0 bg-white rounded-lg shadow-sm"
                title="PDF File Previewer"
                onLoad={() => setLoading(false)}
              ></iframe>
            )}

            {isImage && (
              <div className="max-w-full max-h-full flex items-center justify-center p-4">
                <img
                  src={item.downloadURL}
                  alt={item.title}
                  className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-sm transition-transform duration-200"
                  style={{ transform: `scale(${scale})` }}
                  onLoad={() => setLoading(false)}
                />
              </div>
            )}

            {!isPdf && !isImage && (
              <div className="text-center p-8">
                <p className="text-sm text-luxury-muted">
                  Pre-visualization is not supported for this file type.
                </p>
                <a
                  href={item.downloadURL}
                  download={item.originalFileName}
                  className="inline-flex items-center gap-2 mt-4 bg-luxury-charcoal hover:bg-luxury-accent text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Download size={14} />
                  Download File ({item.originalFileName})
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocPreviewModal;
