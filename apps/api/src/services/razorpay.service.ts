import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import logger from '../config/logger';

class RazorpayService {
  private instance: Razorpay;

  constructor() {
    this.instance = new Razorpay({
      key_id: env.RAZORPAY_API_TEST_KEY,
      key_secret: env.RAZORPAY_KEY_TEST_SECRET,
    });
  }

  /**
   * Create a Razorpay Subscription
   * @param planId Razorpay Plan ID (e.g. plan_N3v...)
   * @param totalCount Total number of billing cycles (e.g. 12 or 999 for indefinite)
   * @param metadata Custom metadata to be stored in the notes
   */
  async createSubscription(planId: string, totalCount: number = 999, metadata: Record<string, string> = {}) {
    try {
      logger.info({ planId, metadata }, '[Razorpay] Creating subscription');
      
      const subscription = await this.instance.subscriptions.create({
        plan_id: planId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: 1,
        notes: metadata,
      });

      return subscription;
    } catch (error) {
      logger.error({ error, planId }, '[Razorpay] Failed to create subscription');
      throw error;
    }
  }

  /**
   * Create a Razorpay Order for one-time payments (top-ups)
   * @param amount Amount in paise (100 paise = 1 INR)
   * @param currency Currency code (default INR)
   * @param notes Custom metadata
   */
  async createOrder(amount: number, currency: string = 'INR', notes: Record<string, string> = {}) {
    try {
      logger.info({ amount, currency, notes }, '[Razorpay] Creating order');
      
      const order = await this.instance.orders.create({
        amount,
        currency,
        notes,
      });

      return order;
    } catch (error) {
      logger.error({ error, amount }, '[Razorpay] Failed to create order');
      throw error;
    }
  }

  /**
   * Verify Razorpay Webhook Signature
   * @param rawBody The unparsed request body string/buffer
   * @param signature The signature from x-razorpay-signature header
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    try {
      const hmac = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET);
      hmac.update(rawBody);
      const generatedSignature = hmac.digest('hex');
      
      return generatedSignature === signature;
    } catch (error) {
      logger.error({ error }, '[Razorpay] Signature verification failed');
      return false;
    }
  }

  /**
   * Fetch subscription details
   */
  async getSubscription(subscriptionId: string) {
    return this.instance.subscriptions.fetch(subscriptionId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = true) {
    return this.instance.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
  }
}

export const razorpayService = new RazorpayService();
/* Default export for consistency with other services if needed */
export default razorpayService;
