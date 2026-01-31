type WhatsAppItem = {
  name: string;
  price: number;
  quantity: number;
  variantId?: string | null;
};

type WhatsAppOrder = {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: WhatsAppItem[];
  total: number;
};

export function buildWhatsAppMessage(order: WhatsAppOrder) {
  let message = `🛒 *New Order*\n\n`;

  message += `*Customer Details*\n`;
  message += `Name: ${order.customer.name}\n`;
  message += `Phone: ${order.customer.phone}\n`;
  message += `Address: ${order.customer.address}\n\n`;

  message += `*Items Ordered*\n`;
  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    if (item.variantId) {
      message += `   Size: ${item.variantId}\n`;
    }
    message += `   ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
  });

  message += `\n*Total:* ₹${order.total}`;

  return message;
}

export function getWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
