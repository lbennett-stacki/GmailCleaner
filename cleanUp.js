require('dotenv').config()

const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const destinationLabel = "Archive - 2023 II"

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL,
);

oauth2Client.setCredentials({
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function moveEmailsToArchive() {
  try {
    const resLabels = await gmail.users.labels.list({ userId: "me" });
    const labels = resLabels.data.labels;
    const archiveLabel = labels.find(
      (label) => label.name === destinationLabel,
    );

    if (!archiveLabel) {
      console.log(`Label '${destinationLabel}' not found.`);
      return;
    }

    const archiveLabelId = archiveLabel.id;

    const resMessages = await gmail.users.messages.list({
      userId: "me",
      q: "in:inbox",
    });

    if (!resMessages.data.messages || resMessages.data.messages.length === 0) {
      console.log("No messages found.");
      return;
    }

    const messages = resMessages.data.messages;

    for (const message of messages) {
      await gmail.users.messages.modify({
        userId: "me",
        id: message.id,
        requestBody: {
          addLabelIds: [archiveLabelId],
          removeLabelIds: ["INBOX"],
        },
      });
      console.log(`Message ${message.id} moved to '${destinationLabel}'`);
    }
  } catch (error) {
    console.error("Error moving emails:", error);
  }
}

moveEmailsToArchive();
