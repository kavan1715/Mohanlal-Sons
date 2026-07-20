import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpload } from "../../hooks/useUpload";
import UploadProgress from "./UploadProgress";

const ADMIN_CATEGORIES = [
  "Medical Report",
  "Prescription",
  "Invoice",
  "Insurance",
  "Identity Proof",
  "Agreement",
  "Other"
];

const WALLET_CATEGORIES = [
  "Passport",
  "PAN Card",
  "Aadhaar",
  "Insurance",
  "Medical Report",
  "Lab Report",
  "Prescription",
  "Invoice",
  "Images",
  "Other"
];

const UploadModal = ({ 
  isOpen, 
  onClose, 
  clientUser = null, // Set if Admin uploading for client
  onSuccess,
  isWalletUpload = false // Set true if Client uploading to their own wallet
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  const fileInputRef = useRef(null);
  
  // Custom Hook
  const { 
    startUpload, 
    progress, 
    uploading, 
    completed, 
    error: uploadError, 
    resetUpload 
  } = useUpload(clientUser?.uid);

  const categoriesList = isWalletUpload ? WALLET_CATEGORIES : ADMIN_CATEGORIES;

  useEffect(() => {
    if (isOpen) {
      resetUpload();
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setValidationError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setValidationError("");
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf("."));
      setTitle(nameWithoutExt);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setValidationError("");
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    setFile(droppedFile);
    if (!title) {
      const nameWithoutExt = droppedFile.name.substring(0, droppedFile.name.lastIndexOf("."));
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!file) {
      setValidationError("Please select a file to upload.");
      return;
    }
    if (!title.trim()) {
      setValidationError("Please enter a document title.");
      return;
    }
    if (!category) {
      setValidationError("Please choose a category.");
      return;
    }

    const folderPath = isWalletUpload 
      ? `wallet/${clientUser.uid}` 
      : `documents/${clientUser.uid}`;

    console.log("[Document Upload] Upload started for file:", file.name);

    try {
      // 1. Dispatch upload to Cloudinary
      const result = await startUpload(file, folderPath);
      
      if (!result) {
        throw new Error("Upload failed on Cloudinary.");
      }

      console.log("[Document Upload] Cloudinary upload completed.");
      console.log("[Document Upload] Cloudinary response:", {
        secure_url: result.secure_url,
        public_id: result.public_id,
        original_filename: result.original_filename,
        bytes: result.bytes,
        created_at: result.created_at
      });

      // 2. Save metadata to Firestore
      console.log("[Document Upload] Firestore write started.");
      await onSuccess(title.trim(), description.trim(), category, result);
      console.log("[Document Upload] Firestore write completed. Document ID created in Firestore.");

      // 3. Clear loading states and schedule close
      setTimeout(() => {
        console.log("[Document Upload] Upload state reset.");
        resetUpload();
        setFile(null);
        setTitle("");
        setDescription("");
        setCategory("");
        onClose();
        console.log("[Document Upload] Document list refreshed (realtime listener triggered).");
      }, 1500);

    } catch (err) {
      console.error("[Document Upload] Upload workflow failed:", err);
      
      // If upload finished but database save failed, show the requested alert text
      if (progress === 100 || completed) {
        setValidationError("Document uploaded to Cloudinary but metadata could not be saved.");
      } else {
        setValidationError(err.message || "Upload process failed.");
      }

      // Ensure loading state and spinners are cleared
      resetUpload();
      console.log("[Document Upload] Upload state reset.");
    }
  };

  const currentError = validationError || uploadError;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-luxury-charcoal/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white border border-luxury-border shadow-2xl rounded-2xl w-full max-w-lg p-6 sm:p-8 flex flex-col relative text-left"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-luxury-charcoal uppercase tracking-wider">
              {isWalletUpload ? "Upload to Personal Wallet" : "Upload Client Document"}
            </h3>
            {!uploading && (
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-gray-100 rounded-full transition-all text-luxury-muted hover:text-luxury-charcoal"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Alert Banner */}
          {currentError && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{currentError}</span>
            </div>
          )}

          {/* Uploading progress overlay */}
          {uploading || completed ? (
            <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-8 z-10">
              <UploadProgress progress={progress} completed={completed} error={uploadError} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Profile Card Summary */}
              {!isWalletUpload && clientUser && (
                <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-xl flex items-center gap-3">
                  <img 
                    src={clientUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${clientUser.displayName}`} 
                    alt={clientUser.displayName} 
                    className="w-9 h-9 rounded-full border border-luxury-border"
                  />
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-luxury-muted block">Client Profile</span>
                    <span className="text-xs font-bold text-luxury-charcoal block">{clientUser.displayName}</span>
                    <span className="text-[10px] text-gray-400 block">{clientUser.email}</span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Identity Passport Verification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-xs outline-none focus:border-luxury-charcoal transition-all"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                  Category
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-xs outline-none focus:border-luxury-charcoal transition-all"
                >
                  <option value="">-- Choose Category --</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description (Admin Only) */}
              {!isWalletUpload && (
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                    Description / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide additional context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-xs outline-none focus:border-luxury-charcoal transition-all resize-none"
                  />
                </div>
              )}

              {/* Drag Zone */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                  Select File
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-luxury-border/60 hover:border-luxury-charcoal bg-gray-50/50 hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-1">
                      <FileText className="text-luxury-accent w-8 h-8" />
                      <span className="text-xs font-bold text-luxury-charcoal max-w-[250px] truncate">
                        {file.name}
                      </span>
                      <span className="text-[9px] text-luxury-muted font-semibold">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-luxury-muted w-8 h-8" />
                      <span className="text-xs text-luxury-charcoal font-bold">
                        Drag &amp; Drop here or browse
                      </span>
                      <span className="text-[10px] text-gray-400">
                        PDF, PNG, JPG, JPEG, DOC, DOCX (Max 20MB)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-luxury-border hover:bg-gray-50 text-luxury-charcoal text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-luxury-charcoal hover:bg-luxury-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Upload size={13} />
                  Upload Document
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadModal;
