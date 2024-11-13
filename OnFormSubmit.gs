function doGet(e) {
  const userHash = e.parameter.hash; // The hash from the QR code URL
  const userEmail = Session.getActiveUser().getEmail(); // The email of the person scanning the code
  const timestamp = new Date();

  // Step 1: Authenticate the user scanning the QR code
  const authSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Authorized_Users");
  const authEmails = authSheet.getRange("A2:A" + authSheet.getLastRow()).getValues().flat();

  // Check if the scanning user's email is in the authorized list
  if (!authEmails.includes(userEmail)) {
    return HtmlService.createHtmlOutput("<p>Access Denied: You are not authorized to check in with this Google account.</p>");
  }

  // Step 2: Look up the intended recipient in Form Responses based on the hash
  const formSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses"); // Use the exact name here
  if (!formSheet) {
    return HtmlService.createHtmlOutput("<p>Error: Form Responses sheet not found.</p>");
  }
  
  const data = formSheet.getDataRange().getValues(); // Get all rows in Form Responses

  let recipientName = '';
  let recipientEmail = '';

  // Find the intended recipient by matching the hash in Form Responses
  for (let i = 1; i < data.length; i++) { // Start from row 1 to skip headers
    if (data[i][6] === userHash) { // Assuming hash is in column 7
      recipientName = data[i][2]; // Name in column 3
      recipientEmail = data[i][1]; // Email in column 2
      break;
    }
  }

  // Step 3: If recipient found, log to ScanLog
  if (recipientName && recipientEmail) {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ScanLog") || SpreadsheetApp.getActiveSpreadsheet().insertSheet("ScanLog");
    logSheet.appendRow([timestamp, recipientName, recipientEmail]);

    // Show a confirmation message
    return HtmlService.createHtmlOutput("<p>Thank you for checking in, " + recipientName + "!</p>");
  } else {
    // Show an error if the QR code hash does not match any entries
    return HtmlService.createHtmlOutput("<p>Access Denied: This QR code is invalid or not authorized.</p>");
  }
}


function onFormSubmit(e) {
  const name = e.values[2];
  const email = e.values[1];
  
  // Generate SHA-256 hash of the email for the QR code link
  const hashedEmail = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email)
    .map(b => (b + 256).toString(16).slice(-2))
    .join("");

  // Store the hashed email in the Form Responses sheet for lookup
  const formSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = formSheet.getLastRow();
  formSheet.getRange(lastRow, 7).setValue(hashedEmail); 

  // Generate a redirection link with the hashed email as a parameter
  const redirectUrl = `https://script.google.com/macros/s/API_HERE/exec?hash=${hashedEmail}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(redirectUrl)}&size=200x200`;
  const qrCodeResponse = UrlFetchApp.fetch(qrCodeUrl);
  
  const qrCodeBlob = qrCodeResponse.getBlob();
  const file = DriveApp.createFile(qrCodeBlob);
  const qrCodeLink = file.getUrl();
  
  // Log the QR Code link in the form response sheet
  formSheet.getRange(lastRow, 6).setValue(qrCodeLink);

  // Send personalized email with QR code
  MailApp.sendEmail({
    to: email,
    subject: 'Buzz Festival 2024 QR Code',
    body: `Hi ${name},\n\nHere is your QR code for the Buzz Festival 2024. Display it at the gate to check in.\n\nBest regards,\nThe Organizers`,
    attachments: [file]
  });
}
