require('dotenv').config()

const { google } = require('googleapis');
const express = require('express');
const app = express();
const port = 3000;

const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/callback'
);

const scopes = ['https://www.googleapis.com/auth/gmail.modify'];
const url = auth.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting this url:');
console.log(url);

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);

  console.log('Access Token:', tokens.access_token);
  console.log('Refresh Token:', tokens.refresh_token);

  res.send('Authorization complete! You can close this tab.');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

