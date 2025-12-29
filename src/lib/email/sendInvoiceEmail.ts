import { transporter } from './transporter';
import { generateInvoicePdf } from '@/lib/invoice/generateInvoicePdf';
import type { OrderDTO } from '@/types/order';

export async function sendInvoiceEmail(order: OrderDTO, to: string) {
  const pdfBuffer = await generateInvoicePdf(order);

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: `Invoice – Order ${order._id}`,
    text: 'Your invoice is attached.',
    attachments: [
      {
        filename: `invoice-${order._id}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
