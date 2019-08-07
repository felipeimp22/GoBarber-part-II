export default {
  host: process.env.MAIL_HOST, // 'smtp.mailtrap.io',
  port: process.env.MAIL_PORT, // 2525,
  secure: false,
  auth: {
    user: process.env.MAIL_USER, // '79ff3e0231a025',
    pass: process.env.MAIL_PASS, // '13a941f3346d4d',
  },
  default: {
    from: 'teamGo<noreply@gobarber.com',
  },
};
