import React from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const PDFViewer = ({ isOpen, file, onClose }) => {
  if (!isOpen || !file) return null;

  const url = file.cloudinaryUrl || file.downloadURL;
  const fileName = file.fileName || file.originalFileName || "document.pdf";

  return (
    <div className="fixed inset-0 z-50 bg-luxury-charcoal/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-luxury-border shadow-2xl rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative"
      >
        {/* Header Toolbar */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0 text-left">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-bold text-luxury-charcoal truncate" title={file.title}>
              {file.title}
            </h3>
            <span className="text-[10px] text-gray-400 mt-0.5 block truncate max-w-[250px]">{fileName}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-luxury-muted hover:text-luxury-charcoal hover:bg-gray-150 rounded transition-all"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </a>
            
            <a
              href={url}
              download={fileName}
              className="p-1.5 text-luxury-muted hover:text-luxury-charcoal hover:bg-gray-150 rounded transition-all"
              title="Download PDF"
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

        {/* PDF Frame */}
        <div className="flex-1 bg-gray-100 border-0 overflow-hidden relative">
          <iframe
            src={`${url}#toolbar=1`}
            className="w-full h-full border-0 bg-white"
            title="Secure PDF Viewer"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
};

export default PDFViewer;
