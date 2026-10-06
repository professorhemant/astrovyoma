// SMS notifications via Fast2SMS.
// If FAST2SMS_API_KEY is not set, messages are logged to console only —
// useful in development without needing a real key.

async function sendSms(mobile, message) {
  const key = process.env.FAST2SMS_API_KEY;
  if (!key) {
    console.log(`[SMS-LOG] To ${mobile}: ${message}`);
    return;
  }
  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: mobile,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    if (!data.return) console.error('[SMS] Fast2SMS error:', JSON.stringify(data));
    else console.log(`[SMS] Sent to ${mobile}`);
  } catch (err) {
    console.error('[SMS] Failed to send:', err.message);
  }
}

async function notifyCustomerBookingConfirmed({ mobile, name, paathName, refId, date, panditMobile }) {
  const dateStr = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const msg = `AstroVyoma: Namaste ${name}! Your booking is CONFIRMED. Ref: ${refId} | Puja: ${paathName} | Date: ${dateStr}. Pandit Ji will perform the puja and send you a video clip on WhatsApp within 24 hrs of completion. - AstroVyoma`;
  await sendSms(mobile, msg);
}

async function notifyPanditNewBooking({ panditMobile, refId, paathName, customerName, date, timeSlot, panditAmount }) {
  const dateStr = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const msg = `AstroVyoma New Booking! Ref: ${refId} | Puja: ${paathName} | Customer: ${customerName} | Date: ${dateStr} | Time: ${timeSlot || 'Flexible'} | Your Earnings: Rs.${Math.round(panditAmount)}. Login to portal to view details.`;
  await sendSms(panditMobile, msg);
}

module.exports = { sendSms, notifyCustomerBookingConfirmed, notifyPanditNewBooking };
