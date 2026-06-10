import { getGmailClient } from "./google";

export async function createPaymentDraft(
  accessToken: string,
  fullName: string,
  paymentDate: string,
  paymentType: string
): Promise<{ draftId: string; subject: string }> {
  const gmail = getGmailClient(accessToken);
  const accountsEmail = process.env.ACCOUNTS_EMAIL!;

  const subject = `Payment Sheet - ${paymentDate} - ${fullName} - ${paymentType}`;

  const body = `Dear Accounts Team,

Good day!

Kindly see the attached payment sheet for my student, ${fullName}. The following documents are also provided as required:

- Consultation Sheet
- Payment Sheet
- Proof of Payment
- Signed Letter of Offer

If you need any further information, please let me know.

Thank you.`;

  const emailLines = [
    `To: ${accountsEmail}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    body,
  ];

  const raw = Buffer.from(emailLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw },
    },
  });

  return {
    draftId: res.data.id!,
    subject,
  };
}
