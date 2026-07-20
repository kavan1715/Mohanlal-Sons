import React, { useState } from "react";
import { 
  FileText, 
  FileImage, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  HardDrive,
  Check,
  X
} from "lucide-react";
import { motion } from "framer-motion";

const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const formatDate = (dateObj) => {
  if (!dateObj) return "—";
  let date;
  if (dateObj.seconds) {
    date = new Date(dateObj.seconds * 1000);
  } else {
    date = new Date(dateObj);
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const FileCard = ({ 
  item, 
  onPreview, 
  onDelete, 
  onRename, 
  isAdminView = false, 
  isWalletItem = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(item.title || "");

  const handleSaveRename = () => {
    if (newTitle.trim() && newTitle.trim() !== item.title) {
      onRename(item.id, newTitle.trim());
    }
    setIsEditing(false);
  };

  const getFileIcon = (fileName = "") => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return <FileText className="text-red-500 w-10 h-10 shrink-0" />;
    } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      return <FileImage className="text-blue-500 w-10 h-10 shrink-0" />;
    } else {
      return <File className="text-luxury-muted w-10 h-10 shrink-0" />;
    }
  };

  const isPdfOrImage = (fileName = "") => {
    const ext = fileName.split(".").pop().toLowerCase();
    return ["pdf", "png", "jpg", "jpeg", "webp"].includes(ext);
  };

  const isPDF = (fileName = "") => {
    return fileName.split(".").pop().toLowerCase() === "pdf";
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white/80 border border-luxury-border/40 rounded-2xl p-5 shadow-soft backdrop-blur-md flex flex-col justify-between hover:shadow-md transition-all text-left"
    >
      <div>
        {/* Top Icon & Badge Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            {getFileIcon(item.originalFileName)}
            <div className="min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border border-luxury-border px-2 py-1 rounded text-xs outline-none focus:border-luxury-charcoal bg-white w-32"
                    autoFocus
                  />
                  <button onClick={handleSaveRename} className="p-1 bg-green-50 border border-green-200 text-green-600 rounded hover:bg-green-600 hover:text-white transition-all">
                    <Check size={12} />
                  </button>
                  <button onClick={() => { setIsEditing(false); setNewTitle(item.title); }} className="p-1 bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <h4 className="text-xs font-bold text-luxury-charcoal truncate max-w-[120px]" title={item.title}>
                    {item.title}
                  </h4>
                  {!isAdminView && isWalletItem && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="opacity-0 group-hover:opacity-100 text-luxury-muted hover:text-luxury-charcoal transition-all p-0.5"
                    >
                      <Edit3 size={11} />
                    </button>
                  )}
                </div>
              )}
              <span className="text-[10px] text-gray-400 block truncate max-w-[150px]" title={item.originalFileName}>
                {item.originalFileName}
              </span>
            </div>
          </div>

          <span className="bg-luxury-sand/50 text-luxury-charcoal px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-luxury-border/30 shrink-0">
            {item.category}
          </span>
        </div>

        {/* Description (if Admin Upload) */}
        {!isWalletItem && item.description && (
          <p className="text-[11px] text-gray-500 font-light leading-relaxed mb-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100 italic">
            "{item.description}"
          </p>
        )}

        {/* Metadata Details */}
        <div className="space-y-1.5 text-[10px] text-luxury-muted border-t border-gray-100 pt-3 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-luxury-accent/60 shrink-0" />
            <span>Uploaded: <strong>{formatDate(item.uploadedAt)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive size={12} className="text-luxury-accent/60 shrink-0" />
            <span>Size: <strong>{formatBytes(item.fileSize)}</strong></span>
          </div>
          {!isWalletItem && (
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-luxury-accent/60 shrink-0" />
              <span>By: <strong className="text-luxury-charcoal">{item.uploadedBy || "System"}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex gap-2.5 pt-3 border-t border-gray-100">
        {isPdfOrImage(item.originalFileName) ? (
          <button
            onClick={() => onPreview(item)}
            className="flex-1 py-1.5 px-2.5 bg-luxury-charcoal hover:bg-luxury-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <Eye size={12} />
            Preview
          </button>
        ) : (
          <a
            href={item.downloadURL}
            download={item.originalFileName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-1.5 px-2.5 bg-luxury-charcoal hover:bg-luxury-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm text-center"
          >
            <Download size={12} />
            Download
          </a>
        )}

        {/* Download Option for PDF/Images inside card too */}
        {isPdfOrImage(item.originalFileName) && (
          <a
            href={item.downloadURL}
            download={item.originalFileName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border border-luxury-border hover:bg-gray-50 text-luxury-charcoal rounded-lg transition-all"
            title="Download File"
          >
            <Download size={12} />
          </a>
        )}

        {/* Delete Trigger (Clients can delete wallet items, Admin can delete admin-docs and client-wallet items) */}
        {((!isAdminView && isWalletItem) || (isAdminView)) && (
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-100 hover:border-red-600 transition-all"
            title="Delete File"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FileCard;
