/**
 * Test helper: generate a pass for an appointment.
 *
 * Usage (dry-run, no DB):
 *   node scripts/test_generate_pass.js
 *
 * Real run (uses DB + Twilio + Email):
 *   MONGO_URI="mongodb://..." EMAIL_USER=... EMAIL_PASS=... TWILIO_SID=... TWILIO_AUTH_TOKEN=... TWILIO_PHONE=... node scripts/test_generate_pass.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const qrcode = require('qrcode');
const Pass = require('../models/pass');
const Visitor = require('../models/visitor');
const Appointment = require('../models/appointment');
const sendEmail = require('../utils/sendemail');
const sendSms = require('../utils/sendsms');

async function run() {
  const useDb = !!process.env.MONGO_URI;

  if (useDb) {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DBNAME || undefined });
    console.log('Connected');
  }

  // create a mock visitor + appointment when no DB
  let visitor = {
    name: 'Test Visitor',
    email: process.env.TEST_EMAIL || 'test@example.local',
    phone: process.env.TEST_PHONE || '+15005550006', // Twilio magic test number
  };

  let appointmentId = null;

  if (useDb) {
    // find or create visitor
    let v = await Visitor.findOne({ email: visitor.email });
    if (!v) {
      v = await Visitor.create({ name: visitor.name, email: visitor.email, phone: visitor.phone });
      console.log('Created visitor', v._id.toString());
    }
    visitor = v;

    // create an appointment marked approved
    const appt = await Appointment.create({ visitor: v._id, host: v._id, purpose: 'Test', visitdate: new Date(), status: 'approved' });
    appointmentId = appt._id;
    console.log('Created appointment', appointmentId.toString());
  }

  // generate pass data
  const passnumber = `PASS-${Date.now()}`;
  const qrdata = JSON.stringify({ passnumber, visitor });
  const qrCodeUrl = await qrcode.toDataURL(qrdata);

  if (useDb) {
    const createdPass = await Pass.create({ appointment: appointmentId, visitor: visitor._id, qrcode: qrCodeUrl, passnumber, validtill: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    console.log('Created pass in DB:', createdPass.passnumber);

    // notify
    await sendEmail(visitor.email, 'visitor pass generated', `your visitor pass ${createdPass.passnumber} has been generated successfully`);
    await sendSms(visitor.phone, `Your visitor pass ${createdPass.passnumber} is ready.`);
  } else {
    console.log('\nDRY RUN — pass content below (no DB)\n');
    console.log('passnumber:', passnumber);
    console.log('qrcode length:', qrCodeUrl.length);
    console.log('would send email to', visitor.email);
    console.log('would send sms to', visitor.phone);
    console.log('\nTo run against your DB and send real SMS/email, set MONGO_URI, EMAIL_USER, EMAIL_PASS, TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE, then re-run this script.');
  }

  if (useDb) await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exitCode = 1;
});
