/**
 * Cloudinary File Upload Service
 */

/**
 * Uploads a file directly to Cloudinary using an unsigned preset.
 * Tracks upload progress via XMLHttpRequest.
 * 
 * @param {File} file - The file object to upload
 * @param {string} folder - Target folder path on Cloudinary (e.g. documents/uid)
 * @param {function} onProgress - Callback function for progress tracking (0 to 100)
 * @returns {Promise<object>} Cloudinary response payload
 */
export const uploadToCloudinary = (file, folder, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    // Mock Sandbox fallback for testing/demo offline
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const mockUrl = URL.createObjectURL(file);
          resolve({
            secure_url: mockUrl,
            public_id: `mock_cloudinary_${Date.now()}`,
            original_filename: file.name.substring(0, file.name.lastIndexOf(".")),
            bytes: file.size,
            created_at: new Date().toISOString(),
            format: file.name.split(".").pop().toLowerCase()
          });
        }
      }, 100);
    });
  }

  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      if (folder) {
        formData.append("folder", folder);
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          const err = JSON.parse(xhr.responseText || "{}");
          reject(new Error(err.error?.message || "Cloudinary upload failed"));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during Cloudinary upload"));
      };

      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
};
