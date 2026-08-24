/**
 * SJ Jewelers Support Configuration
 * Configurable customer support contact details.
 */

export const CUSTOMER_SUPPORT_PHONE =
  import.meta.env.VITE_CUSTOMER_SUPPORT_PHONE || '+91 94562-84829';

export const CUSTOMER_SUPPORT_EMAIL =
  import.meta.env.VITE_CUSTOMER_SUPPORT_EMAIL || 'goldhouse@gmail.com';

/**
 * Returns a tel: URI formatted for mobile telephone links.
 */
export const getTelephoneLink = (phone = CUSTOMER_SUPPORT_PHONE) => {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  return `tel:${digits}`;
};
