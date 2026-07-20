import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  FileText, 
  FolderLock, 
  Plus, 
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Context
import { useAuth } from "../../context/AuthContext";

// Modular Services & Hooks
import { subscribeToUserBookings } from "../../firebase/firebase";
import { 
  saveWalletMetadata, 
  deleteWalletRecord, 
  renameWalletRecord, 
  markNotificationsRead 
} from "../../services/documentService";
import { useDocuments } from "../../hooks/useDocuments";

// Modular UI Components
import DocumentCard from "../../components/documents/DocumentCard";
import UploadModal from "../../components/documents/UploadModal";
import PDFViewer from "../../components/documents/PDFViewer";
import ImageViewer from "../../components/documents/ImageViewer";
import SearchBar from "../../components/documents/SearchBar";
import CategoryFilter from "../../components/documents/CategoryFilter";

const Dashboard = () => {
  const { user } = useAuth();

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState("appointments"); // 'appointments' | 'documents' | 'wallet'
  
  // Bookings list state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Real-time custom hook subscription for files and unread badge count
  const { 
    documents, 
    walletItems, 
    unreadCount, 
    loadingDocs, 
    loadingWallet 
  } = useDocuments(user?.uid);

  // Search & Filter State
  const [fileSearch, setFileSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Dialog Controls
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Subscribe to Bookings
  useEffect(() => {
    if (!user || !user.email) return;

    const unsubscribe = subscribeToUserBookings(
      user.email,
      (data) => {
        setBookings(data);
        setLoadingBookings(false);
      },
      (err) => {
        console.error("Dashboard user bookings error:", err);
        setLoadingBookings(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Clear notifications on documents tab viewing
  useEffect(() => {
    if (activeTab === "documents" && user && user.uid && unreadCount > 0) {
      markNotificationsRead(user.uid);
    }
    // Clear search values when changing view tabs
    setFileSearch("");
    setCategoryFilter("");
    setSortOrder("newest");
  }, [activeTab, user, unreadCount]);

  // Derived booking variables
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  // Active files selector
  const activeFiles = activeTab === "documents" ? documents : walletItems;
  const categoriesList = activeTab === "documents"
    ? ["Medical Report", "Prescription", "Invoice", "Insurance", "Identity Proof", "Agreement", "Other"]
    : ["Passport", "PAN Card", "Aadhaar", "Insurance", "Medical Report", "Lab Report", "Prescription", "Invoice", "Images", "Other"];

  // Filtered & Sorted files list
  const processedFiles = activeFiles
    .filter(file => {
      const fileName = file.fileName || file.originalFileName || "";
      const matchQuery = 
        file.title?.toLowerCase().includes(fileSearch.toLowerCase()) ||
        fileName.toLowerCase().includes(fileSearch.toLowerCase()) ||
        file.category?.toLowerCase().includes(fileSearch.toLowerCase());
      const matchCategory = categoryFilter ? file.category === categoryFilter : true;
      return matchQuery && matchCategory;
    })
    .sort((a, b) => {
      const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
      const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
      
      if (sortOrder === "newest") return timeB - timeA;
      if (sortOrder === "oldest") return timeA - timeB;
      if (sortOrder === "largest") return b.fileSize - a.fileSize;
      if (sortOrder === "smallest") return a.fileSize - b.fileSize;
      return 0;
    });

  // Wallet Management Operations
  const handleWalletUploadSuccess = async (title, description, category, cloudinaryResult) => {
    try {
      await saveWalletMetadata(user.uid, title, category, cloudinaryResult);
      showToast("Document saved to your personal wallet!");
    } catch (err) {
      console.error(err);
      showToast("Failed to save wallet document metadata.", "error");
    }
  };

  const handleRenameWallet = async (itemId, newTitle) => {
    try {
      await renameWalletRecord(itemId, newTitle);
      showToast("Document renamed successfully.");
    } catch (err) {
      console.error(err);
      showToast("Failed to rename document.", "error");
    }
  };

  const handleDeleteTrigger = (file) => {
    setDeleteTarget({
      id: file.id,
      title: file.title
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWalletRecord(deleteTarget.id);
      showToast("File deleted from your secure wallet.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete the file.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const isPdfFile = (fileName = "") => {
    return fileName.split(".").pop().toLowerCase() === "pdf";
  };

  return (
    <div className="min-h-screen bg-luxury-cream/40 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="pt-8"></div>

        {/* Dynamic Alert Banner */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-lg text-xs font-semibold ${
                toast.type === "error" 
                  ? "bg-red-50 border-red-200 text-red-800" 
                  : "bg-green-50 border-green-200 text-green-800"
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Controls Navigation */}
        <div className="flex flex-wrap border-b border-luxury-border/30 mb-8 bg-luxury-white p-1.5 rounded-2xl max-w-lg shadow-soft border text-left">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-display text-[10px] tracking-wider uppercase font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "appointments"
                ? "bg-luxury-charcoal text-white shadow-md"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            <Calendar size={14} />
            Appointments
          </button>
          
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-display text-[10px] tracking-wider uppercase font-bold transition-all flex items-center justify-center gap-2 relative ${
              activeTab === "documents"
                ? "bg-luxury-charcoal text-white shadow-md"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            <FileText size={14} />
            My Documents
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-[9px] flex items-center justify-center font-bold animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-display text-[10px] tracking-wider uppercase font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "wallet"
                ? "bg-luxury-charcoal text-white shadow-md"
                : "text-luxury-muted hover:text-luxury-charcoal"
            }`}
          >
            <FolderLock size={14} />
            My Wallet
          </button>
        </div>

        {/* APPOINTMENTS TAB */}
        {activeTab === "appointments" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-luxury-white p-6 rounded-2xl border border-luxury-border/40 shadow-soft text-left">
                <p className="text-[10px] font-bold text-luxury-muted uppercase tracking-wider">Total Booked</p>
                <h3 className="text-3xl font-serif font-bold text-luxury-charcoal mt-2">{totalBookings}</h3>
              </div>
              <div className="bg-luxury-white p-6 rounded-2xl border border-luxury-border/40 shadow-soft text-left">
                <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Pending Review</p>
                <h3 className="text-3xl font-serif font-bold text-yellow-600 mt-2">{pendingCount}</h3>
              </div>
              <div className="bg-luxury-white p-6 rounded-2xl border border-luxury-border/40 shadow-soft text-left">
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Confirmed Slots</p>
                <h3 className="text-3xl font-serif font-bold text-green-700 mt-2">{confirmedCount}</h3>
              </div>
              <div className="bg-luxury-white p-6 rounded-2xl border border-luxury-border/40 shadow-soft text-left">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Cancelled</p>
                <h3 className="text-3xl font-serif font-bold text-red-600 mt-2">{cancelledCount}</h3>
              </div>
            </div>

            {loadingBookings ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-accent"></div>
              </div>
            ) : bookings.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-luxury-white p-12 text-center rounded-[2rem] border border-luxury-border/50 shadow-soft max-w-lg mx-auto"
              >
                <Calendar className="mx-auto text-luxury-muted/40 mb-4" size={48} />
                <h3 className="text-lg font-serif font-bold text-luxury-charcoal">No Appointments Scheduled</h3>
                <p className="text-sm text-luxury-muted mt-2 font-light leading-relaxed">
                  You haven't scheduled any advisory or styling briefings yet. Partner with us to establish your corporate compliance or tailoring outlines.
                </p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 mt-6 bg-luxury-charcoal hover:bg-luxury-accent text-white font-display text-xs tracking-widest uppercase font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md"
                >
                  Book First Consultation
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-luxury-charcoal mb-4 text-left">
                  Scheduled Appointments
                </h3>
                <div className="grid gap-6">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      whileHover={{ y: -2 }}
                      className="bg-luxury-white p-6 sm:p-8 rounded-[1.5rem] border border-luxury-border/40 shadow-soft transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="space-y-3 text-left">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold text-luxury-charcoal bg-luxury-sand border border-luxury-border/40 px-3 py-1 rounded-full">
                            {booking.service}
                          </span>
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            booking.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : booking.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs text-luxury-muted mt-2 font-light">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-luxury-accent" />
                            <span>Date: <strong>{booking.preferredDate}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-luxury-accent" />
                            <span>Time: <strong>{booking.preferredTime}</strong></span>
                          </div>
                        </div>

                        {booking.message && (
                          <p className="text-xs text-luxury-muted leading-relaxed font-light bg-luxury-cream/40 p-3 rounded-lg border border-luxury-border/20 max-w-xl">
                            <strong>My Notes:</strong> {booking.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-luxury-border/30 gap-2">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-luxury-muted uppercase tracking-wider font-semibold block">
                            Date Requested
                          </span>
                          <span className="text-xs font-light text-luxury-charcoal block mt-0.5">
                            {booking.createdAt ? (
                              new Date(booking.createdAt.seconds ? booking.createdAt.seconds * 1000 : booking.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            ) : "—"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECURE DOCUMENTS & WALLET TABS */}
        {activeTab !== "appointments" && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-luxury-white p-6 rounded-2xl border border-luxury-border/40 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-luxury-charcoal uppercase tracking-wider">
                  {activeTab === "documents" ? "My Documents" : "My Secure Wallet"}
                </h3>
                <p className="text-xs text-luxury-muted font-light mt-0.5">
                  {activeTab === "documents"
                    ? "Access documents and briefs uploaded for you by Mohanlal & Sons."
                    : "Upload personal documents (Passport, Aadhaar) directly into your private wallet."}
                </p>
              </div>

              {activeTab === "wallet" && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="py-2.5 px-4 bg-luxury-charcoal hover:bg-luxury-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  Add File
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-luxury-border/40 shadow-soft flex flex-col md:flex-row gap-4 justify-between items-stretch">
              <SearchBar value={fileSearch} onChange={setFileSearch} placeholder="Search file title, category, or name..." />
              <CategoryFilter
                categories={categoriesList}
                selectedCategory={categoryFilter}
                onCategoryChange={setCategoryFilter}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
              />
            </div>

            {/* Content Lists */}
            {((activeTab === "documents" && loadingDocs) || (activeTab === "wallet" && loadingWallet)) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white/60 border border-luxury-border/30 rounded-2xl p-5 h-44 animate-pulse flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-3/4 h-3.5 bg-gray-200 rounded"></div>
                      <div className="w-1/2 h-2.5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : processedFiles.length === 0 ? (
              <div className="bg-luxury-white p-16 rounded-[2rem] border border-luxury-border/50 shadow-soft text-center max-w-lg mx-auto flex flex-col items-center">
                <FileText className="text-luxury-muted/30 w-16 h-16 mb-4" />
                <h4 className="text-base font-bold text-luxury-charcoal uppercase tracking-wider">No files found</h4>
                <p className="text-xs text-luxury-muted mt-2 max-w-xs font-light">
                  {fileSearch || categoryFilter 
                    ? "Try clearing or resetting search filters."
                    : activeTab === "documents"
                    ? "Mohanlal & Sons hasn't uploaded any documents for you yet."
                    : "Your personal secure wallet is empty. Click 'Add File' to secure your files here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {processedFiles.map(file => (
                  <DocumentCard
                    key={file.id}
                    item={file}
                    onPreview={(f) => setPreviewFile(f)}
                    onDelete={handleDeleteTrigger}
                    onRename={handleRenameWallet}
                    isAdminView={false}
                    isWalletItem={activeTab === "wallet"}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Document Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        clientUser={user}
        onSuccess={handleWalletUploadSuccess}
        isWalletUpload={true}
      />

      {/* PDF Viewer Dialog */}
      {previewFile && isPdfFile(previewFile.fileName || previewFile.originalFileName) && (
        <PDFViewer
          isOpen={!!previewFile}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Image Previewer Dialog */}
      {previewFile && !isPdfFile(previewFile.fileName || previewFile.originalFileName) && (
        <ImageViewer
          isOpen={!!previewFile}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-luxury-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-luxury-border/50 shadow-2xl p-6 w-full max-w-sm text-center">
            <Trash2 className="text-red-500 w-12 h-12 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-luxury-charcoal uppercase tracking-wider">Remove Wallet File?</h4>
            <p className="text-xs text-luxury-muted mt-2 mb-6 font-light leading-relaxed">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong> from your private wallet? This action is permanent.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-4 border border-luxury-border hover:bg-gray-50 text-luxury-charcoal text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-grow py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
