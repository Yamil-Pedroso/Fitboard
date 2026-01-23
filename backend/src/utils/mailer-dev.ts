import nodemailer from "nodemailer";

export async function sendResetEmailDev(to: string, link: string) {
  const testAcc = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: testAcc.user, pass: testAcc.pass },
  });

  const info = await transporter.sendMail({
    from: "FitBoard Dev <no-reply@fitboard.local>",
    to,
    subject: "Passwort zurücksetzen",
    text: `Reset-Link: ${link}`,
    html: `<p>Klicke hier zum Zurücksetzen:</p><p><a href="${link}">${link}</a></p>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("Ethereal preview:", previewUrl);
  return previewUrl;
}
