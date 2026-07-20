import { useState } from "react";
import { uploadToCloudinary } from "../services/cloudinary";

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "doc", "docx"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * Custom hook to coordinate uploading documents to Cloudinary
 * 
 * @param {string} userId - Target client user ID
 * @returns {object} Upload methods and lifecycle states
 */
export const useUpload = (userId) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Triggers the file verification and upload flow
   * 
   * @param {File} file - The file object selected
   * @param {string} folder - Destination folder on Cloudinary
   * @returns {Promise<object|null>} Cloudinary result payload or null on failure
   */
  const startUpload = async (file, folder = "") => {
    setProgress(0);
    setUploading(true);
    setCompleted(false);
    setError(null);

    // 1. Checks
    if (!file) {
      setError("Please select a file to upload.");
      setUploading(false);
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds the maximum 20MB limit.");
      setUploading(false);
      return null;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Unsupported file format. Please upload PDF, PNG, JPG, JPEG, DOC, or DOCX.");
      setUploading(false);
      return null;
    }

    try {
      // 2. Dispatch upload to Cloudinary
      const targetFolder = folder || `documents/${userId}`;
      const result = await uploadToCloudinary(file, targetFolder, (percent) => {
        setProgress(percent);
      });

      setCompleted(true);
      setUploading(false);
      return result;

    } catch (err) {
      console.error("Upload handler failed:", err);
      setError(err.message || "Failed to complete upload.");
      setUploading(false);
      return null;
    }
  };

  const resetUpload = () => {
    setProgress(0);
    setUploading(false);
    setCompleted(false);
    setError(null);
  };

  return {
    startUpload,
    progress,
    uploading,
    completed,
    error,
    resetUpload
  };
};
export default useUpload;
