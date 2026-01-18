export function normalizeIndianPhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');

  if (cleaned.startsWith('+91')) {
    return cleaned;
  }

  if (cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  return `+91${cleaned}`;
}
