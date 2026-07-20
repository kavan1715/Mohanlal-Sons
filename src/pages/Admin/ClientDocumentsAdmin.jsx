import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Upload, 
  ArrowLeft, 
  Trash2, 
  FileText, 
  FolderLock, 
  Plus,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";

// Modular Services & Hooks
import { getAllUsers } from "../../firebase/firebase";
import { 
  saveDocMetadata, 
  deleteDocRecord, 
  deleteWalletRecord, 
  createDocNotification 
} from "../../services/documentService";
import { useDocuments } from "../../hooks/useDocuments";

// Modular UI Components
import DocumentCard from "../../components/documents/DocumentCard";
import UploadModal from "../../components/documents/UploadModal";
import PDFViewer from "../../components/documents/PDFViewer";
import ImageViewer from "../../components/documents/ImageViewer";
import SearchBar from "../../components/documents/SearchBar";
import CategoryFilter from "../../components/documents/CategoryFilter";

const ClientDocumentsAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search User
  const [userSearch, setUserSearch] = useState("");

  // Sub-hook for the selected user
  const { 
    documents: userDocs, 
    walletItems: userWallet, 
    loadingDocs, 
    loadingWallet 
  } = useDocuments(selectedUser?.uid);

  // Client Details Filters
  const [detailTab, setDetailTab] = useState("documents"); // "documents" | "wallet"
  const [fileSearch, setFileSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Modals Controls
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title, isWallet }

  // Load clients
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await getAllUsers();
        // filter out admin roles from standard document directories
        const clientUsers = fetchedUsers.filter(u => u.role !== "admin");
        setUsers(clientUsers);
      } catch (err) {
        console.error("Failed to load admin documents users list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Filtered Users
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Active files block
  const activeUserFiles = detailTab === "documents" ? userDocs : userWallet;
  
  // Filtered & Sorted files
  const processedFiles = activeUserFiles
    .filter(file => {
      const matchQuery = 
        file.title?.toLowerCase().includes(fileSearch.toLowerCase()) ||
        (file.fileName || file.originalFileName)?.toLowerCase().includes(fileSearch.toLowerCase());
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

  const categoriesList = detailTab === "documents" 
    ? ["Medical Report", "Prescription", "Invoice", "Insurance", "Identity Proof", "Agreement", "Other"]
    : ["Passport", "PAN Card", "Aadhaar", "Insurance", "Medical Report", "Lab Report", "Prescription", "Invoice", "Images", "Other"];

  // Upload handler
  const handleUploadSuccess = async (title, description, category, cloudinaryResult) => {
    // 1. Save metadata in Firestore
    await saveDocMetadata(selectedUser.uid, title, description, category, cloudinaryResult);
    // 2. Dispatch unread document alert notification to client
    await createDocNotification(selectedUser.uid, title, category);
  };

  const handleDeleteTrigger = (file) => {
    setDeleteTarget({
      id: file.id,
      title: file.title,
      isWallet: detailTab === "wallet"
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.isWallet) {
        await deleteWalletRecord(deleteTarget.id);
      } else {
        await deleteDocRecord(deleteTarget.id);
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Preview file click handler
  const handlePreviewFile = (file) => {
    setPreviewFile(file);
  };

  const isPdfFile = (fileName = "") => {
    return fileName.split(".").pop().toLowerCase() === "pdf";
  };

  return (
    <div className="space-y-6">
      
      {/* DIRECTORY LIST PANEL */}
      {!selectedUser ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-luxury-charcoal uppercase tracking-wider text-left">Client Directories</h3>
              <p className="text-xs text-luxury-muted font-light mt-0.5 text-left">Manage secure Cloudinary files and check digital wallets for all registered clients.</p>
            </div>
            <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search clients by name or email..." />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-luxury-muted font-light text-xs">
              No clients found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((client) => (
                <div 
                  key={client.uid} 
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={client.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${client.displayName}`}
                      alt={client.displayName}
                      className="w-12 h-12 rounded-full border border-luxury-border/30 object-cover shrink-0"
                    />
                    <div className="min-w-0 text-left">
                      <h4 className="text-sm font-bold text-luxury-charcoal truncate" title={client.displayName}>
                        {client.displayName}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate mt-0.5">
                        <Mail size={11} className="shrink-0" />
                        <span>{client.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-4 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => { setSelectedUser(client); setIsUploadOpen(true); }}
                      className="flex-1 py-2 px-3 bg-gray-50 hover:bg-luxury-charcoal hover:text-white border border-gray-200 text-luxury-charcoal text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} />
                      Upload
                    </button>
                    <button
                      onClick={() => { setSelectedUser(client); setDetailTab("documents"); }}
                      className="flex-grow py-2 px-3 bg-luxury-charcoal hover:bg-luxury-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FolderOpen size={12} />
                      View Files
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        
        // CLIENT FOLDER DETAIL VIEW
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 text-left">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-2 border border-gray-200 hover:bg-luxury-charcoal hover:text-white text-luxury-charcoal rounded-xl transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-luxury-charcoal">{selectedUser.displayName}</h3>
                  <span className="bg-luxury-sand text-luxury-charcoal px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-luxury-border/30">Client Directory</span>
                </div>
                <p className="text-[11px] text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="py-2.5 px-4 bg-luxury-charcoal hover:bg-luxury-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Upload size={14} />
              Add Document
            </button>
          </div>

          {/* Tab Menu */}
          <div className="flex border-b border-gray-200 bg-white p-1.5 rounded-xl max-w-sm shadow-sm border text-left">
            <button
              onClick={() => setDetailTab("documents")}
              className={`flex-1 py-2 px-3 rounded-lg font-display text-[10px] tracking-wider uppercase font-bold transition-all flex items-center justify-center gap-1.5 ${
                detailTab === "documents"
                  ? "bg-luxury-charcoal text-white shadow-sm"
                  : "text-gray-500 hover:text-luxury-charcoal"
              }`}
            >
              <FileText size={13} />
              Documents ({userDocs.length})
            </button>
            <button
              onClick={() => setDetailTab("wallet")}
              className={`flex-1 py-2 px-3 rounded-lg font-display text-[10px] tracking-wider uppercase font-bold transition-all flex items-center justify-center gap-1.5 ${
                detailTab === "wallet"
                  ? "bg-luxury-charcoal text-white shadow-sm"
                  : "text-gray-500 hover:text-luxury-charcoal"
              }`}
            >
              <FolderLock size={13} />
              Client Wallet ({userWallet.length})
            </button>
          </div>

          {/* Filters Row */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch">
            <SearchBar value={fileSearch} onChange={setFileSearch} placeholder="Search file title, category, or name..." />
            <CategoryFilter
              categories={categoriesList}
              selectedCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>

          {/* Loading Indicator */}
          {((detailTab === "documents" && loadingDocs) || (detailTab === "wallet" && loadingWallet)) ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold"></div>
            </div>
          ) : processedFiles.length === 0 ? (
            <div className="bg-white p-16 rounded-[2rem] border border-gray-200 shadow-sm text-center max-w-lg mx-auto flex flex-col items-center">
              <FileText className="text-gray-300 w-16 h-16 mb-4" />
              <h4 className="text-base font-bold text-luxury-charcoal uppercase tracking-wider">No documents available</h4>
              <p className="text-xs text-luxury-muted mt-2 max-w-xs font-light">
                {fileSearch || categoryFilter 
                  ? "Try resetting your search query filter."
                  : detailTab === "documents"
                  ? "You haven't uploaded any documents for this client yet."
                  : "This client hasn't added any personal files to their wallet yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {processedFiles.map(file => (
                <DocumentCard
                  key={file.id}
                  item={file}
                  onPreview={handlePreviewFile}
                  onDelete={handleDeleteTrigger}
                  isAdminView={true}
                  isWalletItem={detailTab === "wallet"}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal Drawer */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        clientUser={selectedUser}
        onSuccess={handleUploadSuccess}
        isWalletUpload={false}
      />

      {/* PDF View Drawer */}
      {previewFile && isPdfFile(previewFile.fileName || previewFile.originalFileName) && (
        <PDFViewer
          isOpen={!!previewFile}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Image Previewer Drawer */}
      {previewFile && !isPdfFile(previewFile.fileName || previewFile.originalFileName) && (
        <ImageViewer
          isOpen={!!previewFile}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-luxury-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-sm text-center">
            <Trash2 className="text-red-500 w-12 h-12 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-luxury-charcoal uppercase tracking-wider">Confirm Document Deletion</h4>
            <p className="text-xs text-luxury-muted mt-2 mb-6 font-light leading-relaxed">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? This will permanently wipe the file index from your database records.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-4 border border-gray-200 hover:bg-gray-50 text-luxury-charcoal text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-grow py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDocumentsAdmin;
