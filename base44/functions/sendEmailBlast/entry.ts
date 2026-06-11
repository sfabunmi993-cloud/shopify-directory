import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, body } = await req.json();
    
    if (!subject || !body) {
      return Response.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    // Get all users from the app
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    if (allUsers.length === 0) {
      return Response.json({ error: 'No users found in the app' }, { status: 404 });
    }

    // Build RFC 2822 email message
    const from = 'Shopify Partners Directory';
    const messageLines = [
      `From: ${from}`,
      `To: undisclosed-recipients:;`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: quoted-printable',
      '',
      body,
    ];
    
    const rawMessage = messageLines.join('\r\n');
    const encodedMessage = btoa(rawMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send email');
    }

    return Response.json({ 
      success: true, 
      message: `Email blast sent to ${allUsers.length} users`,
      recipientCount: allUsers.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});