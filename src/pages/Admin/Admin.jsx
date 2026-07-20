import React, { useState, useEffect } from "react";
import { 
  subscribeToBookings, 
  subscribeToContactMessages, 
  updateDocumentStatus 
} from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { Calendar, MessageSquare, Check, X, ShieldAlert, BookOpen, Clock, CalendarCheck, Mail, Phone, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { sendEmailNotification } from "../../utils/emailService";
import ClientDocumentsAdmin from "./ClientDocumentsAdmin";

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' | 'messages' | 'documents'
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailAlert, setEmailAlert] = useState(null);

  useEffect(() => {
    // Realtime listeners for bookings and messages
    const unsubscribeBookings = subscribeToBookings(
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => console.error("Admin bookings error:", err)
    );

    const unsubscribeMessages = subscribeToContactMessages(
      (data) => {
        setMessages(data);
        setLoading(false);
      },
      (err) => console.error("Admin messages error:", err)
    );

    return () => {
      unsubscribeBookings();
      unsubscribeMessages();
    };
  }, []);

  const handleUpdateStatus = async (collection, id, status) => {
    try {
      await updateDocumentStatus(collection, id, status);

      // Trigger Email Notification for bookings
      if (collection === "bookings") {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          const result = await sendEmailNotification(booking, status);
          setEmailAlert(result);
          // Auto clear notification after 8 seconds
          setTimeout(() => {
            setEmailAlert(prev => prev && prev.recipient === booking.email ? null : prev);
          }, 8000);
        }
      }
    } catch (err) {
      console.error(`Error updating status for ${id}:`, err);
    }
  };

  // Helper stats
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const unreadMessages = messages.filter(m => m.status === "unread").length;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-8"></div>

        {/* Email Alert Banner */}
        {emailAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 rounded-xl border flex items-start space-x-3 shadow-sm relative ${
              emailAlert.success 
                ? "bg-green-50/70 border-green-200 text-green-800" 
                : "bg-red-50/70 border-red-200 text-red-800"
            }`}
          >
            <Mail className="shrink-0 mt-0.5" size={20} />
            <div className="flex-1 pr-6 text-left">
              <h4 className="text-sm font-semibold uppercase tracking-wider">
                {emailAlert.type === "simulated" ? "Gmail Notification Simulated" : "Gmail Notification Sent"}
              </h4>
              <p className="mt-1 text-xs leading-relaxed">
                An email was generated and routed for <strong>{emailAlert.name}</strong> ({emailAlert.recipient}).
                <br />
                <span className="font-semibold">Subject:</span> {emailAlert.subject}
              </p>
              {emailAlert.type === "simulated" && (
                <p className="mt-2 text-[10px] opacity-80 italic">
                  💡 Note: To send actual emails, specify your EmailJS keys (VITE_EMAILJS_SERVICE_ID, etc.) in your environment variables.
                </p>
              )}
            </div>
            <button 
              onClick={() => setEmailAlert(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Bookings</p>
              <h3 className="text-2xl font-bold text-luxury-charcoal mt-2">{pendingBookings}</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirmed Consultations</p>
              <h3 className="text-2xl font-bold text-green-700 mt-2">{confirmedBookings}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CalendarCheck size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Messages</p>
              <h3 className="text-2xl font-bold text-indigo-700 mt-2">{unreadMessages}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Inquiries</p>
              <h3 className="text-2xl font-bold text-luxury-charcoal mt-2">{bookings.length + messages.length}</h3>
            </div>
            <div className="p-3 bg-luxury-sand text-luxury-gold rounded-lg">
              <BookOpen size={22} />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 mb-8 bg-white p-1.5 rounded-lg max-w-lg shadow-sm border">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-2.5 px-4 rounded-md font-display text-xs tracking-wider uppercase font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "bookings"
                ? "bg-luxury-charcoal text-white shadow-sm"
                : "text-gray-500 hover:text-luxury-charcoal"
            }`}
          >
            <Calendar size={16} />
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-2.5 px-4 rounded-md font-display text-xs tracking-wider uppercase font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "messages"
                ? "bg-luxury-charcoal text-white shadow-sm"
                : "text-gray-500 hover:text-luxury-charcoal"
            }`}
          >
            <MessageSquare size={16} />
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-2.5 px-4 rounded-md font-display text-xs tracking-wider uppercase font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "documents"
                ? "bg-luxury-charcoal text-white shadow-sm"
                : "text-gray-500 hover:text-luxury-charcoal"
            }`}
          >
            <FolderOpen size={16} />
            Client Files
          </button>
        </div>

        {/* Dynamic List Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-luxury-gold"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {activeTab === "bookings" ? (
              /* BOOKINGS TAB */
              bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-light">No bookings received yet.</div>
              ) : (
                <div className="p-6 bg-gray-50/50 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left relative"
                      >
                        <div>
                          {/* Name & Status */}
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                              <h4 className="text-sm font-bold text-luxury-charcoal">{booking.name}</h4>
                              <p className="text-[11px] text-gray-400 mt-0.5">{booking.email}</p>
                            </div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                              booking.status === "confirmed" 
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : booking.status === "cancelled"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          {/* Details Metadata */}
                          <div className="space-y-2.5 my-4 py-3 border-y border-gray-100 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-luxury-charcoal text-[11px]">Service:</span>
                              <span className="bg-luxury-sand text-luxury-charcoal px-2 py-0.5 rounded border border-luxury-border/50 text-[10px] font-semibold">
                                {booking.service}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <Calendar size={13} className="text-gray-400 shrink-0" />
                              <span>{booking.preferredDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <Clock size={13} className="text-gray-400 shrink-0" />
                              <span>{booking.preferredTime}</span>
                            </div>
                            {booking.phone && (
                              <div className="flex items-center gap-2 text-[11px]">
                                <Phone size={13} className="text-gray-400 shrink-0" />
                                <span>{booking.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Client Message */}
                          {booking.message && (
                            <div className="bg-gray-50/80 p-3 rounded-lg text-xs text-gray-500 font-light italic mb-4 border border-gray-100">
                              "{booking.message}"
                            </div>
                          )}
                        </div>

                        {/* Actions buttons */}
                        <div className="flex gap-3 pt-3 border-t border-gray-100 mt-auto">
                          {booking.status !== "confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus("bookings", booking.id, "confirmed")}
                              className="flex-grow py-2 px-3 bg-green-50 hover:bg-green-600 hover:text-white text-green-600 rounded-lg border border-green-200 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Check size={13} />
                              Accept
                            </button>
                          )}
                          {booking.status !== "cancelled" && (
                            <button
                              onClick={() => handleUpdateStatus("bookings", booking.id, "cancelled")}
                              className="flex-grow py-2 px-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg border border-red-200 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <X size={13} />
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : activeTab === "messages" ? (
              /* MESSAGES TAB */
              messages.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-light">No messages received yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sender</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Snippet</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-150">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-luxury-charcoal">{msg.name}</span>
                              <span className="text-xs text-gray-400">{msg.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            <span className="text-xs text-gray-600 font-light" title={msg.message}>
                              {msg.message}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                            {new Date(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              msg.status === "read" 
                                ? "bg-gray-100 text-gray-600 border border-gray-200" 
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse"
                            }`}>
                              {msg.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {msg.status !== "read" ? (
                                <button
                                  onClick={() => handleUpdateStatus("contactMessages", msg.id, "read")}
                                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 rounded text-[10px] uppercase font-bold tracking-wider transition-all"
                                >
                                  Mark Read
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus("contactMessages", msg.id, "unread")}
                                  className="px-3 py-1 bg-gray-50 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded text-[10px] uppercase font-bold tracking-wider transition-all"
                                >
                                  Mark Unread
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* CLIENT FILES TAB */
              <div className="p-6 bg-gray-50/50">
                <ClientDocumentsAdmin />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
