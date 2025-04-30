import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay with your API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

// Create a new Razorpay order
export async function createOrder(amount: number, currency: string = "INR", receipt: string = "") {
  try {
    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: currency,
      receipt: receipt,
      payment_capture: 1, // auto-capture payment
    };
    
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    
    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return false;
  }
}