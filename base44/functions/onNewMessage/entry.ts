import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Triggered automatically when a new Message is created (entity automation).
// Sends a Gmail notification to the partner whenever a client sends them a
// new message or inquiry. Messages sent BY the partner are skipped.
function base64UrlEncode(bytes: Uint8Array): string {
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toAscii(str: string): string {
  return (str || '').replace(/[^\x20-\x7E]/g, '?');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const message = body?.data || body;

    if (!message || !message.id) {
      return Response.json({ skipped: true, reason: 'no message data' });
    }

    // Only notify the partner when a client sends them a message.
    if (message.sender_role === 'partner') {
      return Response.json({ skipped: true, reason: 'sent by partner' });
    }

    const partnerId = message.partner_id;
    if (!partnerId) {
      return Response.json({ skipped: true, reason: 'no partner_id' });
    }

    // Resolve the partner and the best recipient email.
    const partners = await base44.asServiceRole.entities.Partner.filter({ id: partnerId });
    const partner = partners[0];
    if (!partner) {
      return Response.json({ skipped: true, reason: 'partner not found' });
    }

    let recipientEmail = partner.email || '';
    const partnerUserId = partner.created_by_id;
    if (partnerUserId) {
      try {
        const owners = await base44.asServiceRole.entities.User.filter({ id: partnerUserId });
        if (owners[0]?.email) recipientEmail = owners[0].email;
      } catch {
        // fall back to partner.email
      }
    }
    if (!recipientEmail) {
      return Response.json({ skipped: true, reason: 'no recipient email' });
    }

    // Get the Gmail access token (shared connector).
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Resolve the authenticated Gmail account so we can set a valid From header.
    let senderEmail = '';
    try {
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: authHeader });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        senderEmail = profile.emailAddress || '';
      }
    } catch {
      // Gmail will default the sender to the authenticated account.
    }

    const senderName = message.sender_name || message.client_full_name || 'A client';
    const isHire = message.message_type === 'hire_request';
    const subjectText = toAscii(message.subject || `New ${isHire ? 'hire request' : 'message'} from ${senderName}`);

    const clientEmail = message.client_email || '';
    const service = message.client_service || '';
    const budget = message.client_budget || '';
    const storeUrl = message.client_store_url || '';
    const country = message.client_country || '';
    const collaboratorCode = message.collaborator_code || '';

    const bodyLines = [
      `Hi ${partner.name},`,
      '',
      `You have received a new ${isHire ? 'hire request' : 'message'} on the Shopify Partners Directory.`,
      '',
      `From: ${senderName}`,
      clientEmail ? `Client email: ${clientEmail}` : '',
      service ? `Service: ${service}` : '',
      budget ? `Budget: ${budget}` : '',
      storeUrl ? `Store URL: ${storeUrl}` : '',
      country ? `Country: ${country}` : '',
      collaboratorCode ? `Collaborator code: ${collaboratorCode}` : '',
      '',
      'Message:',
      message.body || '',
      '',
      'Log in to your dashboard to reply.',
    ].filter(Boolean).join('\n');

    const mimeHeaders = [
      `To: ${recipientEmail}`,
      senderEmail ? `From: Shopify Partners Directory <${senderEmail}>` : '',
      clientEmail ? `Reply-To: ${clientEmail}` : '',
      `Subject: ${subjectText}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
    ].filter(Boolean).join('\r\n');

    const raw = base64UrlEncode(new TextEncoder().encode(bodyLines));
    const mimeMessage = `${mimeHeaders}\r\n${raw}`;

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: base64UrlEncode(new TextEncoder().encode(mimeMessage)) }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return Response.json({ error: 'gmail send failed', details: errText }, { status: 502 });
    }

    return Response.json({ success: true, sentTo: recipientEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});