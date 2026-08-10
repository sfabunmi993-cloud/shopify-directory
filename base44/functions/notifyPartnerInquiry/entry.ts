import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { partner_id, client_name, client_email, country, store_url, service, budget, collaborator_code, message } = body;

    if (!partner_id || !client_name || !message) {
      return Response.json({ error: 'partner_id, client_name and message are required' }, { status: 400 });
    }

    // Fetch the partner (service role) to find the owner's user account
    const partners = await base44.asServiceRole.entities.Partner.filter({ id: partner_id });
    const partner = partners[0];
    if (!partner) return Response.json({ error: 'Partner not found' }, { status: 404 });

    const partnerUserId = partner.created_by_id;
    let recipientEmail = partner.email;

    // Prefer the partner's registered login email — SendEmail only delivers to registered users
    if (partnerUserId) {
      try {
        const ownerUsers = await base44.asServiceRole.entities.User.filter({ id: partnerUserId });
        if (ownerUsers[0]?.email) recipientEmail = ownerUsers[0].email;
      } catch {
        // fall back to partner.email
      }
    }

    if (!recipientEmail) {
      return Response.json({ error: 'No email address found for this partner' }, { status: 404 });
    }

    const emailBody = `Hi ${partner.name},

You have received a new client inquiry. Here are the details:

Name: ${client_name}
Email: ${client_email || 'N/A'}
Country: ${country || 'N/A'}
Store URL: ${store_url || 'N/A'}
Service Requested: ${service || 'N/A'}
Budget: $${budget || 'N/A'}
Collaborator Code: ${collaborator_code || 'N/A'}

Message:
${message}

Please log in to your dashboard to respond to this inquiry.`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `New Client Inquiry — ${service || 'Partner Directory'}`,
      body: emailBody,
      from_name: 'Shopify Partners Directory',
    });

    return Response.json({ success: true, sentTo: recipientEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}