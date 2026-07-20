import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if credentials are valid and not placeholders
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your_project_id_here";

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock Sandbox:", error);
  }
} else {
  console.warn("Firebase credentials not configured. Running in Mock Sandbox mode with LocalStorage fallback.");
}

// --- MOCK DATABASE AND AUTH STATE FOR SANDBOX ---
const mockAuthListeners = new Set();
let mockCurrentUser = JSON.parse(localStorage.getItem("mock_user") || "null");

const triggerMockAuthChange = (user) => {
  mockCurrentUser = user;
  if (user) {
    localStorage.setItem("mock_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("mock_user");
  }
  mockAuthListeners.forEach(callback => callback(user));
};

// Listen to other tabs' auth changes in mock mode
window.addEventListener("storage", (e) => {
  if (e.key === "mock_user") {
    const user = e.newValue ? JSON.parse(e.newValue) : null;
    mockCurrentUser = user;
    mockAuthListeners.forEach(callback => callback(user));
  }
});

// --- SERVICES EXPORT ---

/**
 * Trigger Google Sign In
 */
export const signInWithGooglePopup = async () => {
  if (isFirebaseConfigured && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store in users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const isNewUser = !userDoc.exists();
      let role = "user";
      
      // Check admins collection or check if email matches admin criteria
      if (isNewUser) {
        // Check admins collection
        const adminQuery = query(collection(db, "admins"), where("email", "==", user.email));
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          role = "admin";
        }
        
        // Also check VITE_ADMIN_EMAILS env variable
        const envAdmins = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
        if (envAdmins.includes(user.email.toLowerCase())) {
          role = "admin";
        }
        
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || "",
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          role,
          createdAt: serverTimestamp(),
          loginTime: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        // User already exists. Get role from document.
        const userDocData = userDoc.data();
        role = userDocData.role || "user";

        // Check again if email was added to VITE_ADMIN_EMAILS in the meantime
        const envAdmins = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
        if (envAdmins.includes(user.email.toLowerCase())) {
          role = "admin";
        }

        await setDoc(userDocRef, {
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          role,
          loginTime: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      }
      
      return { 
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role 
      };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  } else {
    // Mock authentication sign-in
    const email = window.prompt(
      "Mock Sandbox Mode:\nEnter email to sign in (use 'admin@mohanlal.com' to log in as Admin, or any other email for standard user):",
      "admin@mohanlal.com"
    );
    
    if (!email) {
      throw new Error("Login cancelled by user");
    }

    const isAdmin = email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@mohanlal.com";
    const name = email.split('@')[0].toUpperCase();
    const mockUser = {
      uid: "mock-uid-" + Date.now(),
      email: email.toLowerCase(),
      displayName: name + " (Mock)",
      photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=" + name,
      role: isAdmin ? "admin" : "user",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      loginTime: new Date().toISOString()
    };
    
    // Save to mock users list
    const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
    mockUsers[mockUser.uid] = mockUser;
    localStorage.setItem("mock_users", JSON.stringify(mockUsers));
    
    // Set active session
    triggerMockAuthChange(mockUser);
    return mockUser;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  } else {
    triggerMockAuthChange(null);
  }
};

/**
 * Subscribe to authentication state updates
 */
export const subscribeToAuthChanges = (callback) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          let role = "user";
          
          if (userDoc.exists()) {
            role = userDoc.data().role || "user";
          } else {
            // Checking admin queries
            const adminQuery = query(collection(db, "admins"), where("email", "==", user.email));
            const adminSnapshot = await getDocs(adminQuery);
            if (!adminSnapshot.empty) {
              role = "admin";
            }
          }
          
          // Re-verify env admins on every check to ensure it works live
          const envAdmins = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
          if (envAdmins.includes(user.email.toLowerCase())) {
            role = "admin";
          }

          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role
          });
        } catch (err) {
          console.error("Error reading user role from firestore:", err);
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "user"
          });
        }
      } else {
        callback(null);
      }
    });
  } else {
    mockAuthListeners.add(callback);
    // Immediately call with current mock user
    callback(mockCurrentUser);
    return () => {
      mockAuthListeners.delete(callback);
    };
  }
};

/**
 * Submit Consultation Booking
 */
export const submitBooking = async (bookingData) => {
  const payload = {
    ...bookingData,
    status: "pending",
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "bookings"), payload);
  } else {
    // Save to LocalStorage mock bookings
    const bookings = JSON.parse(localStorage.getItem("mock_bookings") || "[]");
    const newBooking = { id: "booking-" + Date.now(), ...payload };
    bookings.push(newBooking);
    localStorage.setItem("mock_bookings", JSON.stringify(bookings));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return newBooking;
  }
};

/**
 * Submit Contact message
 */
export const submitContactMessage = async (messageData) => {
  const payload = {
    ...messageData,
    status: "unread",
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "contactMessages"), payload);
  } else {
    // Save to LocalStorage mock messages
    const messages = JSON.parse(localStorage.getItem("mock_contactMessages") || "[]");
    const newMessage = { id: "msg-" + Date.now(), ...payload };
    messages.push(newMessage);
    localStorage.setItem("mock_contactMessages", JSON.stringify(messages));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return newMessage;
  }
};

/**
 * Fetch Bookings (Realtime listener)
 */
export const subscribeToBookings = (onUpdate, onError) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(bookings);
    }, onError);
  } else {
    const fetchLocalBookings = () => {
      const bookings = JSON.parse(localStorage.getItem("mock_bookings") || "[]");
      // Sort mock bookings desc
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      onUpdate(bookings);
    };

    fetchLocalBookings();
    
    // Set up local polling to simulate subscription
    const interval = setInterval(fetchLocalBookings, 3000);
    return () => clearInterval(interval);
  }
};

/**
 * Fetch a specific user's bookings by email (Realtime listener)
 */
export const subscribeToUserBookings = (userEmail, onUpdate, onError) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "bookings"), where("email", "==", userEmail.toLowerCase()));
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side to avoid index requirement
      bookings.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      onUpdate(bookings);
    }, onError);
  } else {
    const fetchLocalUserBookings = () => {
      const bookings = JSON.parse(localStorage.getItem("mock_bookings") || "[]");
      const userBookings = bookings.filter(b => b.email.toLowerCase() === userEmail.toLowerCase());
      userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      onUpdate(userBookings);
    };

    fetchLocalUserBookings();
    
    // Set up local polling to simulate subscription
    const interval = setInterval(fetchLocalUserBookings, 3000);
    return () => clearInterval(interval);
  }
};

/**
 * Fetch Contact Messages (Realtime listener)
 */
export const subscribeToContactMessages = (onUpdate, onError) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(messages);
    }, onError);
  } else {
    const fetchLocalMessages = () => {
      const messages = JSON.parse(localStorage.getItem("mock_contactMessages") || "[]");
      // Sort mock messages desc
      messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      onUpdate(messages);
    };

    fetchLocalMessages();
    
    // Set up local polling to simulate subscription
    const interval = setInterval(fetchLocalMessages, 3000);
    return () => clearInterval(interval);
  }
};

/**
 * Update document status (e.g. mark booking as confirmed, mark message as read)
 */
export const updateDocumentStatus = async (collectionName, id, status) => {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { status, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    const key = `mock_${collectionName}`;
    const items = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, status, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    localStorage.setItem(key, JSON.stringify(updated));
  }
};

/**
 * Sign In with Email & Password
 */
export const signInWithEmail = async (email, password) => {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;

      // Fetch user role from Firestore doc
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let role = "user";
      
      if (userDoc.exists()) {
        role = userDoc.data().role || "user";
      }

      // Check environment variables admin email configuration
      const envAdmins = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
      if (envAdmins.includes(user.email.toLowerCase())) {
        role = "admin";
        await setDoc(userDocRef, { role }, { merge: true });
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0].toUpperCase(),
        photoURL: user.photoURL,
        role
      };
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    }
  } else {
    // Mock sandbox email sign-in
    const isAdmin = email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@mohanlal.com";
    const name = email.split('@')[0].toUpperCase();
    const mockUser = {
      uid: "mock-uid-" + email.toLowerCase().replace(/[^a-z0-9]/g, ""),
      email: email.toLowerCase(),
      displayName: name + " (Mock)",
      photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=" + name,
      role: isAdmin ? "admin" : "user",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      loginTime: new Date().toISOString()
    };
    
    // Check if user exists in mock_users (in real mock sandbox, any password is valid for demo simplicity!)
    const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
    mockUsers[mockUser.uid] = mockUser;
    localStorage.setItem("mock_users", JSON.stringify(mockUsers));
    
    triggerMockAuthChange(mockUser);
    return mockUser;
  }
};

/**
 * Sign Up / Register with Email & Password
 */
export const signUpWithEmail = async (email, password, displayName) => {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;
      
      // Update display name
      await updateProfile(user, { displayName: displayName.trim() });

      const userDocRef = doc(db, "users", user.uid);
      let role = "user";
      
      // Check admins list
      const envAdmins = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
      if (envAdmins.includes(user.email.toLowerCase())) {
        role = "admin";
      }

      await setDoc(userDocRef, {
        uid: user.uid,
        name: displayName.trim(),
        displayName: displayName.trim(),
        email: user.email,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        role,
        createdAt: serverTimestamp(),
        loginTime: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName.trim(),
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        role
      };
    } catch (error) {
      console.error("Email registration error:", error);
      throw error;
    }
  } else {
    // Mock sandbox sign-up
    const isAdmin = email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@mohanlal.com";
    const mockUser = {
      uid: "mock-uid-" + email.toLowerCase().replace(/[^a-z0-9]/g, ""),
      email: email.toLowerCase(),
      displayName: displayName.trim() + " (Mock)",
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      role: isAdmin ? "admin" : "user",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      loginTime: new Date().toISOString()
    };

    const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
    mockUsers[mockUser.uid] = mockUser;
    localStorage.setItem("mock_users", JSON.stringify(mockUsers));

    triggerMockAuthChange(mockUser);
    return mockUser;
  }
};

export { db, auth, isFirebaseConfigured, storage };

// ==========================================
// SECURE DOCUMENT MANAGEMENT SERVICES
// ==========================================

/**
 * Fetch all registered users (for admin panel)
 */
export const getAllUsers = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error("Failed to fetch Firestore users, using fallback:", err);
      // Fallback to local storage
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
      return Object.values(mockUsers);
    }
  } else {
    const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
    // Seed default mock users for sandboxed demo if empty
    if (Object.keys(mockUsers).length === 0) {
      const initialMockUsers = {
        "mock-uid-kavan": {
          uid: "mock-uid-kavan",
          email: "kavan@prajapati.com",
          displayName: "Kavan Prajapati",
          photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Kavan",
          role: "user"
        },
        "mock-uid-kunal": {
          uid: "mock-uid-kunal",
          email: "kunal@sharma.com",
          displayName: "Kunal Sharma",
          photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Kunal",
          role: "user"
        }
      };
      localStorage.setItem("mock_users", JSON.stringify(initialMockUsers));
      return Object.values(initialMockUsers);
    }
    return Object.values(mockUsers);
  }
};

/**
 * Upload file bytes to Storage (Supports Cloudinary direct unsigned uploads and Firebase Storage fallbacks)
 */
export const uploadFileToStorage = (userId, file, folder, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // 1. Cloudinary Unsigned Upload (Preferred Free Tier option)
  if (cloudName && uploadPreset) {
    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", `${folder}/${userId}`);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

        // Track real upload progress percentage
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              downloadURL: response.secure_url,
              storagePath: response.public_id // Cloudinary public_id
            });
          } else {
            const err = JSON.parse(xhr.responseText || "{}");
            reject(new Error(err.error?.message || "Failed to upload to Cloudinary"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
        xhr.send(formData);

      } catch (err) {
        reject(err);
      }
    });
  }

  // 2. Live Firebase Storage
  if (isFirebaseConfigured && storage) {
    return new Promise((resolve, reject) => {
      const storagePath = `${folder}/${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error("Storage upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadURL, storagePath });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  // 3. Sandbox Mock Mode
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        const mockUrl = URL.createObjectURL(file);
        resolve({
          downloadURL: mockUrl,
          storagePath: `mock_${folder}/${userId}/${Date.now()}_${file.name}`
        });
      }
    }, 100);
  });
};

/**
 * Save Document Metadata (Admin uploads to client)
 */
export const saveDocumentMetadata = async (metadata) => {
  const payload = {
    ...metadata,
    uploadedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
    lastModified: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };
  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "documents"), payload);
  } else {
    const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
    const newDoc = { id: "doc-" + Date.now(), ...payload };
    mockDocs.push(newDoc);
    localStorage.setItem("mock_documents", JSON.stringify(mockDocs));
    return newDoc;
  }
};

/**
 * Subscribe to documents for a specific user
 */
export const subscribeToUserDocuments = (userId, onUpdate) => {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, "documents"),
      where("userId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in-memory to avoid Firestore indexing bottlenecks during dynamic testing
      docs.sort((a, b) => {
        const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
        const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
        return timeB - timeA;
      });
      onUpdate(docs);
    });
  } else {
    const fetchLocalDocs = () => {
      const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
      const filtered = mockDocs.filter(d => d.userId === userId);
      filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      onUpdate(filtered);
    };
    fetchLocalDocs();
    const interval = setInterval(fetchLocalDocs, 2500);
    return () => clearInterval(interval);
  }
};

/**
 * Subscribe to all admin uploaded documents (for admin overview)
 */
export const subscribeToAllDocuments = (onUpdate) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "documents"));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
        const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
        return timeB - timeA;
      });
      onUpdate(docs);
    });
  } else {
    const fetchLocalAllDocs = () => {
      const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
      mockDocs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      onUpdate(mockDocs);
    };
    fetchLocalAllDocs();
    const interval = setInterval(fetchLocalAllDocs, 2500);
    return () => clearInterval(interval);
  }
};

/**
 * Delete Admin Uploaded Document
 */
export const deleteDocument = async (documentId, storagePath) => {
  if (isFirebaseConfigured && db) {
    // 1. Delete file from Storage if exists
    if (storagePath && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn("Storage file delete failed or did not exist:", err);
      }
    }
    // 2. Delete Firestore record
    const docRef = doc(db, "documents", documentId);
    await deleteDoc(docRef);
  } else {
    const mockDocs = JSON.parse(localStorage.getItem("mock_documents") || "[]");
    const filtered = mockDocs.filter(d => d.id !== documentId);
    localStorage.setItem("mock_documents", JSON.stringify(filtered));
  }
};

/**
 * Save Personal Wallet Metadata
 */
export const saveWalletMetadata = async (metadata) => {
  const payload = {
    ...metadata,
    uploadedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };
  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "wallet"), payload);
  } else {
    const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
    const newItem = { id: "wallet-" + Date.now(), ...payload };
    mockWallet.push(newItem);
    localStorage.setItem("mock_wallet", JSON.stringify(mockWallet));
    return newItem;
  }
};

/**
 * Subscribe to client secure wallet
 */
export const subscribeToUserWallet = (userId, onUpdate) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "wallet"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
        const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
        return timeB - timeA;
      });
      onUpdate(items);
    });
  } else {
    const fetchLocalWallet = () => {
      const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
      const filtered = mockWallet.filter(w => w.userId === userId);
      filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      onUpdate(filtered);
    };
    fetchLocalWallet();
    const interval = setInterval(fetchLocalWallet, 2500);
    return () => clearInterval(interval);
  }
};

/**
 * Subscribe to all wallet uploads (for Admin overview)
 */
export const subscribeToAllWalletItems = (onUpdate) => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "wallet"));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
        const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
        return timeB - timeA;
      });
      onUpdate(items);
    });
  } else {
    const fetchLocalAllWallet = () => {
      const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
      mockWallet.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      onUpdate(mockWallet);
    };
    fetchLocalAllWallet();
    const interval = setInterval(fetchLocalAllWallet, 2500);
    return () => clearInterval(interval);
  }
};

/**
 * Delete Wallet File
 */
export const deleteWalletItem = async (itemId, storagePath) => {
  if (isFirebaseConfigured && db) {
    if (storagePath && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn("Storage file delete failed or did not exist:", err);
      }
    }
    const docRef = doc(db, "wallet", itemId);
    await deleteDoc(docRef);
  } else {
    const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
    const filtered = mockWallet.filter(w => w.id !== itemId);
    localStorage.setItem("mock_wallet", JSON.stringify(filtered));
  }
};

/**
 * Rename Wallet File Title
 */
export const renameWalletItem = async (itemId, newTitle) => {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, "wallet", itemId);
    await setDoc(docRef, { title: newTitle, lastModified: serverTimestamp() }, { merge: true });
  } else {
    const mockWallet = JSON.parse(localStorage.getItem("mock_wallet") || "[]");
    const updated = mockWallet.map(w => {
      if (w.id === itemId) {
        return { ...w, title: newTitle, lastModified: new Date().toISOString() };
      }
      return w;
    });
    localStorage.setItem("mock_wallet", JSON.stringify(updated));
  }
};

/**
 * Dispatch unread document alert notification to client
 */
export const createNotification = async (userId, title, message) => {
  const payload = {
    userId,
    title,
    message,
    isRead: false,
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };
  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, "notifications"), payload);
  } else {
    const mockNotifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
    mockNotifs.push({ id: "notif-" + Date.now(), ...payload });
    localStorage.setItem("mock_notifications", JSON.stringify(mockNotifs));
  }
};

/**
 * Listen to unread notifications for a client
 */
export const subscribeToNotificationsCount = (userId, onUpdate) => {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    return onSnapshot(q, (snapshot) => {
      onUpdate(snapshot.size);
    });
  } else {
    const fetchLocalNotifsCount = () => {
      const mockNotifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
      const unreadCount = mockNotifs.filter(n => n.userId === userId && !n.isRead).length;
      onUpdate(unreadCount);
    };
    fetchLocalNotifsCount();
    const interval = setInterval(fetchLocalNotifsCount, 2500);
    return () => clearInterval(interval);
  }
};

/**
 * Clear all unread notifications for a client
 */
export const markNotificationsAsRead = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "notifications"),
          where("userId", "==", userId),
          where("isRead", "==", false)
        )
      );
      const promises = querySnapshot.docs.map(docSnapshot => {
        const docRef = doc(db, "notifications", docSnapshot.id);
        return setDoc(docRef, { isRead: true }, { merge: true });
      });
      await Promise.all(promises);
    } catch (err) {
      console.error("Error clearing notifications:", err);
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
