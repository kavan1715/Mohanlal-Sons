import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/firebase";

/**
 * Custom hook to subscribe to a client's documents, wallet, and notifications count
 * 
 * @param {string} userId - The client user ID
 * @returns {object} Documents, wallet items, loading indicators, and notification stats
 */
export const useDocuments = (userId) => {
  const [documents, setDocuments] = useState([]);
  const [walletItems, setWalletItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [error, setError] = useState(null);

  // 1. Subscribe to Documents
  useEffect(() => {
    if (!userId) {
      setDocuments([]);
      setLoadingDocs(false);
      return;
    }

    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "documents"),
        where("userId", "==", userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort newest first in-memory
          list.sort((a, b) => {
            const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
            const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
            return timeB - timeA;
          });
          setDocuments(list);
          setLoadingDocs(false);
        },
        (err) => {
          console.error("Firestore docs listener error:", err);
          setError(err);
          setLoadingDocs(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Sandbox Mock Fallback
      const fetchLocalDocs = () => {
        const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
        const filtered = mockDocs.filter(d => d.userId === userId);
        filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setDocuments(filtered);
        setLoadingDocs(false);
      };

      fetchLocalDocs();
      const interval = setInterval(fetchLocalDocs, 2500);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // 2. Subscribe to Wallet Items
  useEffect(() => {
    if (!userId) {
      setWalletItems([]);
      setLoadingWallet(false);
      return;
    }

    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "wallet"),
        where("userId", "==", userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          list.sort((a, b) => {
            const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
            const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
            return timeB - timeA;
          });
          setWalletItems(list);
          setLoadingWallet(false);
        },
        (err) => {
          console.error("Firestore wallet listener error:", err);
          setError(err);
          setLoadingWallet(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Sandbox Mock Fallback
      const fetchLocalWallet = () => {
        const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
        const filtered = mockWallet.filter(w => w.userId === userId);
        filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setWalletItems(filtered);
        setLoadingWallet(false);
      };

      fetchLocalWallet();
      const interval = setInterval(fetchLocalWallet, 2500);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // 3. Subscribe to Unread Notifications Count
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("isRead", "==", false)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setUnreadCount(snapshot.size);
        },
        (err) => {
          console.error("Firestore notifications count error:", err);
        }
      );

      return () => unsubscribe();
    } else {
      // Sandbox Mock Fallback
      const fetchLocalCount = () => {
        const mockNotifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
        const count = mockNotifs.filter(n => n.userId === userId && !n.isRead).length;
        setUnreadCount(count);
      };

      fetchLocalCount();
      const interval = setInterval(fetchLocalCount, 2500);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return {
    documents,
    walletItems,
    unreadCount,
    loadingDocs,
    loadingWallet,
    error
  };
};
