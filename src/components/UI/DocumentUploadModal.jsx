import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFileToStorage } from "../../firebase/firebase";

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

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "docx"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const DocumentUploadModal = ({ 
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
  
  // Upload status states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);
  const categoriesList = isWalletUpload ? WALLET_CATEGORIES : ADMIN_CATEGORIES;

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setError("");
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds the maximum 20MB limit.");
      return;
    }

    // Validate extension
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Unsupported file format. Please upload PDF, PNG, JPG, JPEG, or DOCX.");
      return;
    }

    setFile(selectedFile);
    // Autofill title if empty
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
    setError("");
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (droppedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds the maximum 20MB limit.");
      return;
    }

    const ext = droppedFile.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Unsupported format. Allowed: PDF, PNG, JPG, JPEG, DOCX.");
      return;
    }

    setFile(droppedFile);
    if (!title) {
      const nameWithoutExt = droppedFile.name.substring(0, droppedFile.name.lastIndexOf("."));
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Please specify a document title.");
      return;
    }
    if (!category) {
      setError("Please choose a category.");
      return;
    }

    const targetUserId = isWalletUpload ? clientUser.uid : clientUser.uid;
    const storageFolder = isWalletUpload ? "wallet" : "documents";

    setUploading(true);
    setProgress(0);

    try {
      // 1. Upload file bytes to storage
      const { downloadURL, storagePath } = await uploadFileToStorage(
        targetUserId, 
        file, 
        storageFolder, 
        (percent) => setProgress(percent)
      );

      // 2. Prep metadata structure
      const metadata = {
        userId: targetUserId,
        title: title.trim(),
        category,
        originalFileName: file.name,
        storagePath,
        downloadURL,
        fileSize: file.size,
      };

      if (!isWalletUpload) {
        metadata.description = description.trim();
        metadata.uploadedBy = "Admin";
      }

      // 3. Callback to parent to update Firestore
      await onSuccess(metadata);

      setCompleted(true);
      setTimeout(() => {
        // Reset state and close modal
        setFile(null);
        setTitle("");
        setDescription("");
        setCategory("");
        setUploading(false);
        setCompleted(false);
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Upload process failed:", err);
      setError(err.message || "Failed to complete upload.");
      setUploading(false);
    }
  };

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

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Progress Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-8 z-10">
              {completed ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <CheckCircle2 className="text-green-600 w-16 h-16" />
                  <h4 className="text-base font-bold text-luxury-charcoal uppercase tracking-wider mt-2">
                    Upload Completed!
                  </h4>
                  <p className="text-xs text-luxury-muted">Saving document metadata record...</p>
                </motion.div>
              ) : (
                <div className="w-full max-w-xs flex flex-col items-center text-center">
                  <Loader2 className="animate-spin text-luxury-accent mb-4" size={36} />
                  <h4 className="text-sm font-bold text-luxury-charcoal uppercase tracking-wider mb-2">
                    Uploading...
                  </h4>
                  <p className="text-xs text-luxury-muted mb-6">Do not close this panel until completion.</p>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                    <motion.div 
                      className="bg-luxury-charcoal h-full rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-luxury-muted mt-2">
                    {progress}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Read-only client profile display */}
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

            {/* Document Title */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                Document Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Identity Passport Check"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-xs outline-none focus:border-luxury-charcoal transition-all"
              />
            </div>

            {/* Category Dropdown */}
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
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide additional details for the client..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-xs outline-none focus:border-luxury-charcoal transition-all resize-none"
                />
              </div>
            )}

            {/* Drag & Drop File Zone */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                Select Document File
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
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <FileText className="text-luxury-accent w-8 h-8" />
                    <span className="text-xs font-bold text-luxury-charcoal max-w-[250px] truncate">
                      {file.name}
                    </span>
                    <span className="text-[9px] text-luxury-muted">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-luxury-muted w-8 h-8" />
                    <span className="text-xs text-luxury-charcoal font-semibold">
                      Drag &amp; Drop here or click to browse
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Supports PDF, PNG, JPG, JPEG, DOCX (Max 20MB)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-4 rounded-xl bg-luxury-charcoal px-5 py-3 font-display text-[10px] font-bold uppercase tracking-widest text-white shadow-sm hover:bg-luxury-accent transition-all flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              Start Secure Upload
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentUploadModal;
