import { transporter } from './transporter';
import type { OrderDTO } from '@/types/order';

export async function sendOrderConfirmationEmail(order: OrderDTO, to: string, subject?: string) {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.name} ${item.size ? `(${item.size})` : ''}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price * item.quantity}</td>
        </tr>
      `
    )
    .join('');

  const title = subject ?? 'Thank you for your order!';

  const html = `
    <h2>${title}</h2>
    <p>Order ID: <strong>${order._id}</strong></p>

    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th align="left">Item</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <p><strong>Total:</strong> ₹${order.total}</p>

    ${
      order.paymentProvider === 'cod'
        ? `<p>Payment Method: Cash on Delivery</p>`
        : `<p>Payment Method: Online</p>`
    }

    <p>We’ll notify you when your order updates.</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: subject ?? 'Order Confirmation – Kapithan',
    html,
  });
}
