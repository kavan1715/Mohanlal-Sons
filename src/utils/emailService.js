/**
 * Email Notification Service utilizing EmailJS REST API
 */
export const sendEmailNotification = async (booking, status) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const subject = status === "confirmed" 
    ? "Mohanlal & Sons - Consultation Confirmed" 
    : "Mohanlal & Sons - Consultation Status Update";

  const messageParagraph = status === "confirmed"
    ? "We are pleased to inform you that your request for a private strategy consultation has been accepted and confirmed. Please review the detailed schedule below."
    : "We regret to inform you that we are unable to accommodate your requested consultation slot at this time due to scheduling conflicts. You are welcome to coordinate with our partners or submit another slot request.";

  const bodyMessage = messageParagraph;

  const templateParams = {
    to_name: booking.name || "Valued Client",
    to_email: booking.email,
    subject: subject,
    message: messageParagraph,
    client_name: booking.name || "Client",
    client_email: booking.email,
    client_phone: booking.phone || "N/A",
    service: booking.service,
    date: booking.preferredDate,
    time: booking.preferredTime,
    name: booking.name || "Valued Client", // Map to EmailJS "From Name"
    email: booking.email,                  // Map to EmailJS "Reply To"
  };

  // Check if live credentials are configured in .env
  if (serviceId && templateId && publicKey) {
    try {
      console.log("[EmailJS Diagnostic] Dispatching request with:", {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      });

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams,
        }),
      });

      const responseText = await response.text();
      console.log(`[EmailJS Diagnostic] Response Status: ${response.status}, Content: ${responseText}`);

      if (!response.ok) {
        throw new Error(`EmailJS server responded with status ${response.status}: ${responseText}`);
      }

      console.log(`Email successfully dispatched via EmailJS to ${booking.email}`);
      return {
        success: true,
        type: "live",
        recipient: booking.email,
        name: booking.name,
        subject,
        message: bodyMessage,
      };
    } catch (err) {
      console.error("[EmailJS Diagnostic] API Dispatch Exception:", err);
      return {
        success: false,
        error: err.message,
        type: "fallback",
        recipient: booking.email,
        name: booking.name,
        subject,
        message: bodyMessage,
      };
    }
  }

  // Fallback simulator for development/verification
  console.log("%c[Email Simulator] Dispatching notification...", "color: #1e3a8a; font-weight: bold;");
  console.log(`To: ${booking.email}\nSubject: ${subject}\n\n${bodyMessage}`);

  return {
    success: true,
    type: "simulated",
    recipient: booking.email,
    name: booking.name,
    subject,
    message: bodyMessage,
  };
};
