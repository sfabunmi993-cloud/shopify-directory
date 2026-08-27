import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;
    const entityName = event?.entity_name;

    // Fetch all admin users
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) {
      return Response.json({ message: 'No admin users found' });
    }

    let subject = '';
    let body = '';

    if (entityName === 'Partner') {
      const partnerName = data?.name || 'Unknown';
      const partnerEmail = data?.email || 'N/A';
      const partnerCategory = data?.service_category || 'N/A';
      subject = `New Partner Registration Pending: ${partnerName}`;
      body = `
A new partner has registered and is awaiting approval.

Partner Details:
- Name: ${partnerName}
- Email: ${partnerEmail}
- Category: ${partnerCategory}
- Status: Pending

Please review and approve or reject this partner from the Admin Dashboard.
      `.trim();
    } else if (entityName === 'Payment') {
      const userName = data?.user_name || 'Unknown User';
      const userEmail = data?.user_email || 'N/A';
      const partnerName = data?.partner_name || 'N/A';
      const amount = data?.amount ? `₦${Number(data.amount).toLocaleString()}` : 'N/A';
      const description = data?.description || 'N/A';
      subject = `New Payment Submitted: ${userName}`;
      body = `
A new payment has been submitted and is awaiting your approval.

Payment Details:
- From: ${userName} (${userEmail})
- Partner: ${partnerName}
- Amount: ${amount}
- Description: ${description}
- Status: Pending

Please review and approve or reject this payment from the Admin Dashboard.
      `.trim();
    } else {
      return Response.json({ message: 'Unknown entity type' });
    }

    // Send email to all admins
    const emailPromises = admins.map((admin) =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body,
        from_name: 'Shopify Partner Base'
      })
    );

    await Promise.all(emailPromises);

    // Mirror every admin email to a mobile push so admins are notified on-device too.
    const pushPromises = admins.map((admin) =>
      base44.asServiceRole.integrations.Core.SendPushNotification({
        user_id: admin.id,
        title: subject,
        content: body.slice(0, 180),
        action_label: 'Open dashboard',
        action_url: '/admin',
      }).catch(() => null)
    );
    await Promise.all(pushPromises);

    return Response.json({ success: true, notified: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});