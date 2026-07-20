import { 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/firebase";

/**
 * Save Document Metadata (Admin Uploads)
 */
export const saveDocMetadata = async (userId, title, description, category, cloudinaryResult) => {
  const payload = {
    userId,
    title,
    description: description || "",
    category,
    fileName: cloudinaryResult.original_filename,
    fileType: cloudinaryResult.format || cloudinaryResult.original_filename.split(".").pop(),
    fileSize: cloudinaryResult.bytes,
    cloudinaryUrl: cloudinaryResult.secure_url,
    cloudinaryPublicId: cloudinaryResult.public_id,
    uploadedBy: "Admin",
    uploadedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "documents"), payload);
  } else {
    // Sandbox Mock Fallback
    const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
    const newDoc = { id: "doc-" + Date.now(), ...payload, uploadedAt: new Date().toISOString() };
    mockDocs.push(newDoc);
    localStorage.setItem("mock_documents", JSON.stringify(mockDocs));
    return newDoc;
  }
};

/**
 * Save Wallet Item Metadata (Client Uploads)
 */
export const saveWalletMetadata = async (userId, title, category, cloudinaryResult) => {
  const payload = {
    userId,
    title,
    category,
    cloudinaryUrl: cloudinaryResult.secure_url,
    cloudinaryPublicId: cloudinaryResult.public_id,
    fileSize: cloudinaryResult.bytes,
    uploadedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "wallet"), payload);
  } else {
    // Sandbox Mock Fallback
    const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
    const newItem = { id: "wallet-" + Date.now(), ...payload, uploadedAt: new Date().toISOString() };
    mockWallet.push(newItem);
    localStorage.setItem("mock_wallet", JSON.stringify(mockWallet));
    return newItem;
  }
};

/**
 * Delete Document Metadata
 */
export const deleteDocRecord = async (docId) => {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, "documents", docId);
    await deleteDoc(docRef);
  } else {
    const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
    const filtered = mockDocs.filter(d => d.id !== docId);
    localStorage.setItem("mock_documents", JSON.stringify(filtered));
  }
};

/**
 * Delete Wallet Metadata
 */
export const deleteWalletRecord = async (walletId) => {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, "wallet", walletId);
    await deleteDoc(docRef);
  } else {
    const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
    const filtered = mockWallet.filter(w => w.id !== walletId);
    localStorage.setItem("mock_wallet", JSON.stringify(filtered));
  }
};

/**
 * Rename Wallet Item Title
 */
export const renameWalletRecord = async (walletId, newTitle) => {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, "wallet", walletId);
    await setDoc(docRef, { title: newTitle }, { merge: true });
  } else {
    const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
    const updated = mockWallet.map(w => {
      if (w.id === walletId) {
        return { ...w, title: newTitle };
      }
      return w;
    });
    localStorage.setItem("mock_wallet", JSON.stringify(updated));
  }
};

/**
 * Create Client Notification (for Admin uploads)
 */
export const createDocNotification = async (userId, docTitle, category) => {
  const payload = {
    userId,
    title: "New Document Uploaded",
    message: `Admin has uploaded a new ${category}: "${docTitle}"`,
    isRead: false,
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, "notifications"), payload);
  } else {
    const mockNotifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
    mockNotifs.push({ id: "notif-" + Date.now(), ...payload, createdAt: new Date().toISOString() });
    localStorage.setItem("mock_notifications", JSON.stringify(mockNotifs));
  }
};

/**
 * Clear Client Notifications
 */
export const markNotificationsRead = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("isRead", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const promises = querySnapshot.docs.map(docSnapshot => {
        const docRef = doc(db, "notifications", docSnapshot.id);
        return setDoc(docRef, { isRead: true }, { merge: true });
      });
      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  } else {
    const mockNotifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
    const updated = mockNotifs.map(n => {
      if (n.userId === userId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem("mock_notifications", JSON.stringify(updated));
  }
};
