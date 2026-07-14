import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      partner_email,
      partner_name,
      client_name,
      client_email,
      client_country,
      client_store_url,
      client_service,
      client_budget,
      collaborator_code,
      message
    } = body;

    if (!partner_email) {
      return Response.json({ error: 'Partner email is required' }, { status: 400 });
    }

    const subject = `New Client Inquiry — ${client_service}`;
    const textBody = [
      `Hi ${partner_name},`,
      '',
      'You have received a new client inquiry. Here are the details:',
      '',
      `Name: ${client_name}`,
      `Email: ${client_email}`,
      `Country: ${client_country}`,
      `Store URL: ${client_store_url || 'N/A'}`,
      `Service Requested: ${client_service}`,
      `Budget: $${client_budget}`,
      `Collaborator Code: ${collaborator_code || 'N/A'}`,
      '',
      'Message:',
      message,
      '',
      'Please log in to your dashboard to respond to this inquiry.'
    ].join('\n');

    const mime = `To: ${partner_email}\r\nReply-To: ${client_email}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${textBody}`;

    const encodedMessage = btoa(unescape(encodeURIComponent(mime)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `Gmail API error: ${errorText}` }, { status: 500 });
    }

    const result = await response.json();
    return Response.json({ success: true, messageId: result.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});