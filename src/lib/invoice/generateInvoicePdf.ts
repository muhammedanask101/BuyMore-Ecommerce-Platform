import PDFDocument from 'pdfkit';
import type { OrderDTO } from '@/types/order';

export function generateInvoicePdf(order: OrderDTO): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text('Kapithan Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      doc.text(
        `${item.name} ${item.size ? `(${item.size})` : ''} × ${item.quantity} — ₹${
          item.price * item.quantity
        }`
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Tax: ₹${order.tax}`);
    doc.text(`Shipping: ₹${order.shipping}`);
    doc.font('Helvetica-Bold').text(`Total: ₹${order.total}`);

    doc.end();
  });
}
