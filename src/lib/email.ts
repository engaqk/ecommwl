import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});

const theme = {
  navy: '#4A2533',
  beige: '#FFF8F7',
  text: '#333333',
  primary: '#B76E79',
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4EAEB; color: ${theme.text}; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #F4EAEB; padding-bottom: 40px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(74, 37, 51, 0.08); border: 1px solid #f0e6e7; }
    .header { background-color: ${theme.beige}; padding: 35px 20px; text-align: center; border-bottom: 2px solid #f0e6e7; }
    .logo-table { margin: 0 auto; }
    .logo-text { font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: ${theme.navy}; letter-spacing: 1px; line-height: 1; text-decoration: none; }
    .logo-accent { color: ${theme.primary}; }
    .logo-sub { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 8px; font-weight: 600; color: #888888; margin-top: 6px; display: block; text-decoration: none; padding-left: 8px; }
    .content { padding: 40px 35px; background-color: #ffffff; }
    .footer { background-color: #faf7f7; padding: 25px 35px; text-align: center; border-top: 1px solid #f0e6e7; }
    .footer p { margin: 0; font-size: 12px; color: #888888; line-height: 1.5; }
    .footer a { color: ${theme.primary}; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table width="100%" align="center" style="margin-top: 40px;">
      <tr>
        <td align="center">
          <table class="main" width="100%">
            <!-- Header -->
            <tr>
              <td class="header">
                <a href="https://shaza53-creation.vercel.app/" style="text-decoration: none; display: inline-block;">
                  <table class="logo-table" role="presentation">
                    <tr>
                      <td align="center">
                        <div class="logo-text">SHAZA<span class="logo-accent">53</span></div>
                        <div class="logo-sub">Creation</div>
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td class="content">
                ${content}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td class="footer">
                <p>&copy; ${new Date().getFullYear()} <a href="https://shaza53-creation.vercel.app/">Shaza53 Creation</a>. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 11px;">Handcrafted with love, designed for the modern woman.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }): Promise<{ success: boolean; error?: any }> => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    console.error("Email credentials missing. Make sure EMAIL_USER and EMAIL_PASS are set.");
    return { success: false, error: "Email credentials missing (EMAIL_USER / EMAIL_PASS)" };
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"Shaza53 Creation" <${emailUser}>`,
      to,
      subject,
      html: baseTemplate(html)
    });
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email via Gmail:", error);
    return { success: false, error: error?.message || "Unknown Gmail SMTP error" };
  }
};
