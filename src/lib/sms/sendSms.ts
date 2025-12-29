export async function sendSms(to: string, message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS DEV] To: ${to} — ${message}`);
    return;
  }

  // TODO: Integrate MSG91 / Twilio here
}
