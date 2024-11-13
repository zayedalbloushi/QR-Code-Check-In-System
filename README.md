# Google Apps Script QR Code Check-In System

This project is a simple and efficient QR code-based check-in system built with Google Apps Script, Google Sheets, and Google Drive. It is designed to generate personalized QR codes for users, authenticate check-ins, and log visitor activity. The system also supports form submissions and automated email notifications.

## Features

- Generate SHA-256 hash-based QR codes for unique URL links.
- Automatic email sending with personalized QR codes.
- Verification of authorized users for check-ins.
- Logging of check-in activity in Google Sheets.

## Prerequisites

To use this system, you will need:
- A Google Workspace account with access to Google Sheets, Drive, and Mail.
- A Google Apps Script project linked to your Google Sheet.

## Setup Instructions

1. **Create a Google Form and Spreadsheet**
   - Create a Google Form with fields for `Name` and `Email`.
   - Link the form to a Google Sheet and ensure that form responses are captured in a sheet called `Form Responses`.

2. **Add the Script**
   - Open your Google Sheet and navigate to **Extensions > Apps Script**.
   - Copy and paste the provided script into the Apps Script editor.

3. **Configure the Script**
   - Replace `API_HERE` in the script with your deployment URL.
   - Make sure the sheet names `Form Responses` and `Authorized_Users` match your setup.
   - Set up `onFormSubmit` as an installable trigger:
     - Go to **Triggers > Add Trigger**.
     - Select `onFormSubmit` from the function dropdown, choose **From form** and **On form submit**.

4. **Deploy as a Web App**
   - Click **Deploy > New deployment**.
   - Choose **Web app** and configure access permissions as needed (e.g., anyone with the link).
   - Copy the deployment URL and use it to generate QR codes.

## How It Works

### QR Code Generation and Email Sending
- When a user submits the form, `onFormSubmit` is triggered.
- The script:
  - Generates a SHA-256 hash of the user's email.
  - Creates a personalized QR code with a unique URL containing the hash.
  - Saves the QR code in Google Drive.
  - Logs the QR code link in the form response sheet.
  - Sends an email to the user with their QR code as an attachment.

### Check-In and Logging
- When a user scans the QR code, `doGet` is triggered.
- The script:
  - Authenticates the user by checking the `Authorized_Users` sheet.
  - Matches the hash with the user's information from `Form Responses`.
  - Logs the check-in activity in the `ScanLog` sheet.
  - Displays a confirmation message upon successful check-in.

## Customization

- **Email Customization**: Modify the `MailApp.sendEmail` function to customize the email content.
- **QR Code Service**: The script uses `qrserver.com` for generating QR codes. You can replace it with another service if desired.
- **Authorization List**: Add users to `Authorized_Users` sheet for check-in access control.

## Example Usage

1. User submits a form with their name and email.
2. They receive an email with a QR code.
3. They scan the QR code at the event.
4. The system checks if the user checking-in is authorized and logs their check-in.

## Troubleshooting

- Ensure all sheet names are correct and match the script.
- Check for any quota limits on your Google Workspace account, especially for email sending.
- If you encounter authorization issues, verify that `Authorized_Users` contains the correct entries.

---

This QR Code Check-In System provides a streamlined approach to event management using the power of Google Apps Script and Google Workspace tools.
