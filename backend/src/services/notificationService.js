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

// Sends a WhatsApp message via Fast2SMS. Falls back to SMS if WhatsApp fails so
// the astrologer always gets *something*, even on accounts without WA credits.
async function sendWhatsApp(mobile, message) {
  const key = process.env.FAST2SMS_API_KEY;
  const num = String(mobile).replace(/\D/g, '').slice(-10);
  if (!key) {
    console.log(`[WA-LOG] To ${num}: ${message}`);
    return;
  }
  try {
    const res = await fetch('https://www.fast2sms.com/dev/whatsapp', {
      method: 'POST',
      headers: { authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, numbers: num, language: 'english', schedule_time: '' }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    if (!data.return) {
      console.error('[WA] Fast2SMS WA error, falling back to SMS:', JSON.stringify(data));
      await sendSms(num, message);
    } else {
      console.log(`[WA] Sent to ${num}`);
    }
  } catch (err) {
    console.error('[WA] Failed, falling back to SMS:', err.message);
    await sendSms(num, message).catch(() => {});
  }
}

async function notifyPanditIncomingConsultation({ panditPhone, panditName, seekerName, mode }) {
  if (!panditPhone) return;
  const modeLabel = mode === 'video' ? 'video' : 'voice';
  const msg = `AstroVyoma: Namaste ${panditName}! You have an incoming ${modeLabel} call from ${seekerName}. Open your portal to accept: https://astrovyoma.com/pandit-portal`;
  await sendWhatsApp(panditPhone, msg);
}

module.exports = { sendSms, sendWhatsApp, notifyCustomerBookingConfirmed, notifyPanditNewBooking, notifyPanditIncomingConsultation };
