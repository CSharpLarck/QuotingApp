import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import SignatureCanvas from "react-signature-canvas";

import "jspdf-autotable"; // ✅ Allows table formatting
import "./ReleaseLiability.css"; // ✅ Ensure proper styling

const ReleaseLiability = () => {
  const navigate = useNavigate();
  const sigPad = useRef(); // ✅ Signature Pad Reference
  const [formData, setFormData] = useState({
    customerName: "",
    installationAddress: "",
    customerEmail: "",
    optionalEmail: "", // ✅ Added optional email field
    customerPhone: "",
    installerName: "",
    installerCompany: "Designer Blinds & Co",
    installationDate: new Date().toISOString().split("T")[0],
    installationDescription: "",
    customerAcknowledgment: false,
    customerSignature: "",
  });

  const [emailStatus, setEmailStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

    // ✅ Auto-Save Signature When Drawn
  const handleSignature = () => {
    if (!sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.toDataURL(); // Convert signature to Base64
      setFormData({ ...formData, customerSignature: signatureData });
    }
  };
  
    // ✅ Clear Signature Pad
    const clearSignature = () => {
      sigPad.current.clear();
      setFormData({ ...formData, customerSignature: "" });
    };
  // ✅ "Send to Customer" Email (Quick Email)
  const sendCustomerEmail = async () => {
    if (!formData.customerEmail && !formData.optionalEmail) {
      alert("❌ Please enter at least one email to send the form.");
      return;
    }

    setLoading(true);

    const emailParams = {
      to_email: formData.customerEmail || formData.optionalEmail, // ✅ Send to customer or optional recipient
      customer_name: formData.customerName,
      installer_name: formData.installerName,
      installation_date: formData.installationDate,
    };

    emailjs
      .send(
        "service_td0vmlp", // 🔹 Your EmailJS Service ID
        "template_uqh2idx", // 🔹 Use Template #1 (Quick Email)
        emailParams,
        "G2ENDfmIQjtEpgbxH" // 🔹 Your EmailJS Public Key
      )
      .then((response) => {
        console.log("📨 Quick Email sent successfully:", response);
        setEmailStatus("✅ Customer Email Sent!");
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error sending email:", error);
        setEmailStatus("❌ Failed to Send Email.");
        setLoading(false);
      });
  };

  // ✅ "Submit & Finish" Email (Full Form Summary)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Form submission started");

     // ✅ Generate email HTML with full form summary
const emailHTML = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; background: #fff; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);">
  <h2 style="color: #1a237e; text-align: center;">Release of Liability & Installation Acknowledgment</h2>
  
  <p>Dear ${formData.customerName},</p>
  <p>Thank you for choosing Designer Blinds & Co. Below is a summary of your Release of Liability form.</p>

  <hr style="border: 1px solid #ddd;" />

  <h3>Release of Liability and Installation Acknowledgment</h3>
  <p>
    This Release of Liability form serves as an acknowledgment that the window treatments installed by Designer Blinds & Co 
    have been completed to the customer’s satisfaction. By signing below, the customer agrees to release Designer Blinds & Co 
    from any liability related to future damage, defects, or maintenance.
  </p>

  <hr style="border: 1px solid #ddd;" />

  <h3>Customer Information</h3>
  <p><strong>Full Name:</strong> ${formData.customerName}</p>
  <p><strong>Installation Address:</strong> ${formData.installationAddress}</p>
  <p><strong>Installation Date:</strong> ${formData.installationDate}</p>
  <p><strong>Installer Company:</strong> ${formData.installerCompany}</p>

  <h3>Liability Release Agreement</h3>
  <p>${formData.customerAcknowledgment ? "✅ The customer has acknowledged and agreed to the terms." : "❌ The customer has not acknowledged the terms."}</p>

 
          <p><strong>Customer Signature:</strong></p>
          <img src="${formData.customerSignature}" alt="Customer Signature" style="width: 100%; max-width: 300px; border: 1px solid #ddd;"/>

  <hr style="border: 1px solid #ddd;" />
  
  <p style="text-align: center;">If you have any questions, feel free to reach out.</p>
  <p style="text-align: center; font-size: 12px; color: #777;">This is an automated email. Please do not reply.</p>
</div>
`;

      // ✅ Send the form completion email
      await emailjs.send(
        "service_td0vmlp", // 🔹 Your EmailJS Service ID
        "template_6pc3h4v", // 🔹 Use Template #2 (Full Form Summary)
        {
          to_email: `
          ${formData.customerEmail || formData.optionalEmail}, 
          Lauren@designerblindco.com, 
          Matthew@designerblindco.com
        `.trim(), // ✅ Send to multiple recipients
          customer_name: formData.customerName,
          email_content: emailHTML, // ✅ Attach full form HTML content
        },
        "G2ENDfmIQjtEpgbxH"
      );

      console.log("✅ Form completion email sent!");

      alert("✅ Release of Liability Form Submitted Successfully!");
      navigate("/form-completion"); // ✅ Redirect after completion
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("❌ Failed to submit the form.");
    }

    setLoading(false);
  };

  return (
    <div>
      {/* ✅ Email Section Above Main Container */}
      <div className="email-section">
        <h2>Email Release Form to Customer</h2>
        <label>
          Customer Email:
          <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
        </label>
        <button type="button" className="email-btn" onClick={sendCustomerEmail} disabled={loading}>
          {loading ? "Sending..." : "Send to Customer"}
        </button>
        {emailStatus && <p className="email-status">{emailStatus}</p>}
      </div>

      {/* ✅ Main Release of Liability Container */}
      <div className="release-liability-container">
              {/* ✅ Back to Dashboard Button */}

        <h2>Release of Liability and Installation Acknowledgment</h2>
        <p>
          This Release of Liability form serves as an acknowledgment that the window treatments installed by Designer
          Blinds & Co have been completed to the customer’s satisfaction. By signing below, the customer agrees to
          release Designer Blinds & Co from any liability related to future damage, defects, or maintenance.
        </p>

        <form onSubmit={handleSubmit}>
          <h3>Customer Information</h3>
          <label>Full Name: <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required /></label>
          <label>Installation Address: <input type="text" name="installationAddress" value={formData.installationAddress} onChange={handleChange} required /></label>
          <label>
            Installation Date:
            <input type="date" name="installationDate" value={formData.installationDate} onChange={handleChange} required />
          </label>
          <h3>Liability Release Agreement</h3>
          <label className="checkbox-label">
            <input type="checkbox" name="customerAcknowledgment" checked={formData.customerAcknowledgment} onChange={handleChange} required />
            <span>I have read, understood, and agree to the terms outlined above.</span>
          </label>

          {/* ✅ Signature Pad (Auto-Save) */}
          <div className="signature-container">
            <h3>Customer Signature:</h3>
            <SignatureCanvas
              ref={sigPad}
              penColor="black"
              onEnd={handleSignature} // ✅ Auto-Save Signature
              canvasProps={{ width: 300, height: 100, className: "signature-canvas" }}
            />
            {/* ✅ Optional Email Field BELOW Signature Buttons */}
    <label>Email a Copy (Optional): <input type="email" name="optionalEmail" placeholder="(Optional, if you want a copy)" value={formData.optionalEmail} onChange={handleChange} /></label>

            <div className="signature-buttons">
              <button type="button" onClick={clearSignature}>Clear Signature</button>
            </div>
          </div>

    
<button type="submit" className="submit-btn">Submit & Finish</button>
</form>
</div>
</div>
);
};

export default ReleaseLiability;