const express = require("express");
const fs = require("fs");
const { google } = require("googleapis");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Google Drive Auth
const auth = new google.auth.GoogleAuth({
  keyFile: "YOUR_SERVICE_ACCOUNT.json", // 🔹 Your Google Service Account JSON file
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

// 🔹 Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

// 🔹 Upload PDF to Google Drive
const uploadToDrive = async (filePath, fileName) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: ["YOUR_GOOGLE_DRIVE_FOLDER_ID"], // 🔹 Set to your folder's ID
      },
      media: {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
      },
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get the file's webViewLink
    const file = await drive.files.get({
      fileId: response.data.id,
      fields: "webViewLink",
    });

    return file.data.webViewLink;
  } catch (error) {
    console.error("❌ Error uploading file to Google Drive:", error);
    throw error;
  }
};

// 🔹 API Route to Upload PDF
app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const driveLink = await uploadToDrive(filePath, fileName);
    
    // Remove file after upload
    fs.unlinkSync(filePath);
    
    res.json({ success: true, driveLink });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
