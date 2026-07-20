import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const UploadProgress = ({ progress, completed, error }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center">
      {completed ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-2.5"
        >
          <CheckCircle2 className="text-green-600 w-12 h-12" />
          <h4 className="text-xs font-bold text-luxury-charcoal uppercase tracking-wider mt-1.5">
            File Upload Completed!
          </h4>
          <p className="text-[10px] text-luxury-muted">Indexing document credentials...</p>
        </motion.div>
      ) : error ? (
        <div className="text-center">
          <p className="text-xs font-semibold text-red-600">Upload failed.</p>
          <p className="text-[10px] text-red-500 mt-1">{error}</p>
        </div>
      ) : (
        <div className="w-full max-w-xs flex flex-col items-center">
          <Loader2 className="animate-spin text-luxury-accent mb-3" size={26} />
          <h4 className="text-[11px] font-bold text-luxury-charcoal uppercase tracking-wider mb-1.5">
            Uploading Document...
          </h4>
          
          {/* Progress track */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-200 mt-2">
            <motion.div 
              className="bg-luxury-charcoal h-full rounded-full"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-luxury-muted mt-1.5">
            {progress}% Completed
          </span>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
