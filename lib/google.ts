import { google } from "googleapis";

export function getGoogleAuthClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export function getSheetsClient(accessToken: string) {
  const auth = getGoogleAuthClient(accessToken);
  return google.sheets({ version: "v4", auth });
}

export function getDriveClient(accessToken: string) {
  const auth = getGoogleAuthClient(accessToken);
  return google.drive({ version: "v3", auth });
}

export function getGmailClient(accessToken: string) {
  const auth = getGoogleAuthClient(accessToken);
  return google.gmail({ version: "v1", auth });
}
