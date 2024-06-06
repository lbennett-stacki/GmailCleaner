require('dotenv').config()

const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const destinationLabel = "Archive - 2023 II"

const IGNORE_LABELS = "-{label:archive---2022} -{label:archive---2023} -{label:archive---2023-II} -{label:unsubscribe}"

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
      q: `in:inbox ${IGNORE_LABELS}`,
    });

    console.log('Got messages:', resMessages.data.messages.length);
    console.log('First message as example:', resMessages.data.messages[0]);

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

    return messages.length;
  } catch (error) {
    console.error("Error moving emails:", error);
  }

  return 0;
}


async function main() {
  let count = 100;

  while (count > 0) {
    console.log('TICK');
    count = await moveEmailsToArchive();
    console.log('Moved', count, 'messages to archive');
  }
}

main();
