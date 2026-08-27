import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Triggered automatically when a new Payment record is created (entity automation).
// Sends a mobile push notification to the buyer confirming their purchase
// (reviews, domain, premium badge, domain plan, etc. — anything that creates a Payment).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const data = payload?.data || payload || {};

    const userId = data.user_id;
    if (!userId) {
      return Response.json({ skipped: true, reason: 'no user_id' });
    }

    const description = data.description || 'purchase';
    const amount = data.amount ? ` (₦${Number(data.amount).toLocaleString()})` : '';
    const title = 'Payment received ✅';
    const content = `We received your ${description}${amount}. It's now pending admin approval — you'll be notified once it's approved.`;

    try {
      await base44.asServiceRole.integrations.Core.SendPushNotification({
        user_id: userId,
        title,
        content,
        action_label: 'View profile',
        action_url: '/my-profile',
      });
    } catch (pushErr) {
      // Push delivery only works on a native mobile build with push credentials configured.
      return Response.json({ success: true, push: 'unavailable', message: pushErr?.message });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}