import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, to, orderId, data } = body;

    if (!to || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let subject = '';
    let html = '';

    switch (action) {
      case 'ORDER_CONFIRMATION':
        subject = `Order Confirmation - #${orderId.slice(0, 8).toUpperCase()}`;
        html = `
          <h2>Thank you for your order!</h2>
          <p>Hello ${data.customerName || 'there'},</p>
          <p>We've received your order and our artisans are currently preparing it. Your order ID is <strong>${orderId.slice(0, 8).toUpperCase()}</strong>.</p>
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${data.items ? data.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; width: 60px;">
                  <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;" />
                </td>
                <td style="padding: 10px;">
                  <strong>${item.title}</strong><br/>
                  Qty: ${item.quantity}
                </td>
                <td style="padding: 10px; text-align: right;">
                  ₹${item.price * item.quantity}
                </td>
              </tr>
            `).join('') : ''}
          </table>

          <div class="order-summary" style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
            <p><strong>Status:</strong> Processing</p>
          </div>
          <p>We will notify you once your order has been shipped.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://shaza53-creation.vercel.app/orders" style="background-color: #B76E79; color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; display: inline-block;">
              View My Orders
            </a>
          </div>
        `;
        break;

      case 'WELCOME_REGISTRATION':
        subject = "Welcome to Shaza53 Creation!";
        html = `
          <h2 style="color: #4A2533; text-align: center;">Welcome to the Family!</h2>
          <p>Hello ${data.customerName || 'there'},</p>
          <p>Thank you for creating an account with Shaza53 Creation. We're thrilled to have you here!</p>
          <p>With your new account, you can now save your favorite items to your wishlist, track your orders seamlessly, and enjoy a faster checkout experience.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://shaza53-creation.vercel.app/shop" style="background-color: #B76E79; color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; display: inline-block;">
              Start Exploring
            </a>
          </div>
        `;
        break;

      case 'ABANDONED_CART':
        subject = "You left something behind...";
        html = `
          <h2 style="color: #4A2533; text-align: center;">Still thinking about it?</h2>
          <p>Hello ${data.customerName || 'there'},</p>
          <p>We noticed you left some beautiful items in your cart. Our handcrafted bags are made in limited quantities, so make sure to grab yours before they're gone!</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${data.items ? data.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; width: 60px;">
                  <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;" />
                </td>
                <td style="padding: 10px;">
                  <strong>${item.title}</strong>
                </td>
              </tr>
            `).join('') : ''}
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://shaza53-creation.vercel.app/checkout" style="background-color: #B76E79; color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; display: inline-block;">
              Complete Your Order
            </a>
          </div>
        `;
        break;

      case 'SUPPLIER_REGISTRATION':
        subject = "Supplier Application Received";
        html = `
          <h2 style="color: #4A2533; text-align: center;">Thank You for Applying</h2>
          <p>Hello ${data.customerName || 'there'},</p>
          <p>We have successfully received your application to become a supplier for Shaza53 Creation.</p>
          <p>Our team is currently reviewing your profile and will get back to you shortly with the next steps.</p>
          <p style="margin-top: 20px;">We appreciate your interest in partnering with us!</p>
        `;
        break;

      case 'ORDER_SHIPPED':
        subject = `Your Order has been Shipped! - #${orderId.slice(0, 8).toUpperCase()}`;
        html = `
          <h2>Good news! Your bag is on its way.</h2>
          <p>Hello ${data.customerName || 'there'},</p>
          <p>Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has been dispatched.</p>
          
          <h3>Items in this shipment:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${data.items ? data.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; width: 60px;">
                  <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;" />
                </td>
                <td style="padding: 10px;">
                  <strong>${item.title}</strong><br/>
                  Qty: ${item.quantity}
                </td>
              </tr>
            `).join('') : ''}
          </table>

          <div class="order-summary" style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p><strong>Courier Tracking:</strong> ${data.trackingNumber}</p>
          </div>
          <p>You can track your order using the tracking number above.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://shaza53-creation.vercel.app/orders" style="background-color: #B76E79; color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; display: inline-block;">
              Track Order
            </a>
          </div>
        `;
        break;

      case 'REPAYMENT_LINK':
        subject = `Action Required: Payment for Order #${orderId.slice(0, 8).toUpperCase()}`;
        html = `
          <h2>Action Required on Your Order</h2>
          <p>Hello ${data.customerName || 'there'},</p>
          <p>There was an issue verifying the payment for your recent order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong>.</p>
          <p>Please click the button below to upload a new payment screenshot so we can process your order immediately.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.repaymentUrl}" style="background-color: #B76E79; color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; display: inline-block;">
              Complete Payment
            </a>
          </div>
          <p style="margin-top: 20px; font-size: 13px; color: #666;">If you have any questions, please reply to this email.</p>
        `;
        break;

      case 'MARKETING':
        subject = data.subject || "Exciting News from Shaza53 Creation!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1a2b4c; text-align: center; margin-bottom: 20px;">${data.subject}</h2>
            
            <div style="line-height: 1.6; font-size: 15px; color: #444; white-space: pre-wrap; padding: 20px; background: #fdfbf7; border-radius: 8px;">
              ${data.message}
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://shaza53-creation.vercel.app/shop" style="background-color: #B76E79; color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; display: inline-block;">
                Shop Now
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0e6e7; text-align: center; font-size: 11px; color: #999;">
              <p>You received this email because you are subscribed to Shaza53 Creation updates.</p>
            </div>
          </div>
        `;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await sendEmail({ to, subject, html });

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error sending email:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
