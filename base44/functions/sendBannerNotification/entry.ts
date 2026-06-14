import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { partnerEmail, partnerName, message } = await req.json();
  if (!partnerEmail || !message) {
    return Response.json({ error: 'Missing partnerEmail or message' }, { status: 400 });
  }

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: partnerEmail,
    subject: 'Important message from the Shopify Partner Base team',
    body: `Hi ${partnerName || 'Partner'},\n\nYou have a new message from the admin team:\n\n"${message}"\n\nPlease log in to your profile to view and act on this message.\n\nBest regards,\nShopify Partner Base Team`,
  });

  return Response.json({ success: true });
});