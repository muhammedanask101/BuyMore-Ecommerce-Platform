// import Razorpay from "razorpay"
// import crypto from "crypto"

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// })

// export const razorpayProvider = {
//   async createOrder({ amount, currency, receipt }) {
//     const order = await razorpay.orders.create({
//       amount: amount * 100,
//       currency,
//       receipt,
//     })

//     return {
//       id: order.id,
//       amount: order.amount / 100,
//       currency: order.currency,
//       status: "created",
//     }
//   },

//   async verifyPayment({ orderId, paymentId, signature }) {
//     const body = `${orderId}|${paymentId}`
//     const expected = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//       .update(body)
//       .digest("hex")

//     return expected === signature
//   },

//   async refund(paymentId, amount) {
//     const refund = await razorpay.payments.refund(paymentId, {
//       amount: amount * 100,
//     })

//     return { refundId: refund.id }
//   },
// }
