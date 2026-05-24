const Twilio = require('twilio');

const sendSms = async (to, body) => {
  try {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE;

    if (!accountSid || !authToken || !from) {
      console.log('Twilio not configured, skipping SMS');
      return;
    }

    const client = Twilio(accountSid, authToken);
    await client.messages.create({ to, from, body });
    console.log('SMS sent to', to);
  } catch (err) {
    console.log('error sending SMS', err.message || err);
  }
};

module.exports = sendSms;
