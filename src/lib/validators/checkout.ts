import type { ShippingAddress } from '@/types/checkout';
import { normalizeIndianPhone } from '@/lib/utils/phone';

type ValidatedCheckoutAddress = ShippingAddress & {
  phone: string;
};

export function validateCheckoutAddress(address: ShippingAddress): {
  error: string | null;
  value?: ValidatedCheckoutAddress;
} {
  if (!address.name?.trim()) {
    return { error: 'Name is required' };
  }

  if (!address.phone?.trim()) {
    return { error: 'Phone number is required' };
  }

  const normalizedPhone = normalizeIndianPhone(address.phone);

  // Basic Indian mobile sanity check (10 digits after +91)
  if (!/^\+91\d{10}$/.test(normalizedPhone)) {
    return { error: 'Enter a valid Indian mobile number' };
  }

  if (!address.addressLine1?.trim()) {
    return { error: 'Address line 1 is required' };
  }

  if (!address.city?.trim()) {
    return { error: 'City is required' };
  }

  if (!address.state?.trim()) {
    return { error: 'State is required' };
  }

  if (!address.postalCode?.trim()) {
    return { error: 'Postal code is required' };
  }

  // Indian PIN code sanity (not strict validation)
  if (!/^\d{6}$/.test(address.postalCode)) {
    return { error: 'Enter a valid 6-digit postal code' };
  }

  return {
    error: null,
    value: {
      ...address,
      name: address.name.trim(),
      phone: normalizedPhone,
      addressLine1: address.addressLine1.trim(),
      addressLine2: address.addressLine2?.trim() || '',
      city: address.city.trim(),
      state: address.state.trim(),
      postalCode: address.postalCode.trim(),
      country: address.country || 'India',
    },
  };
}
