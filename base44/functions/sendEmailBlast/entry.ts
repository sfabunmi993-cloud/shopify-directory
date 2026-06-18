import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, body, recipients, senderName } = await req.json();
    
    if (!subject || !body) {
      return Response.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    // Determine recipient list
    let emailList = [];
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      // Use provided list of email strings
      emailList = recipients.filter(e => typeof e === 'string' && e.includes('@'));
    } else {
      // Fall back to all users
      const allUsers = await base44.asServiceRole.entities.User.list();
      emailList = allUsers.map(u => u.email).filter(Boolean);
    }
    
    if (emailList.length === 0) {
      return Response.json({ error: 'No recipients found' }, { status: 404 });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const email of emailList) {
      const user = { email };

      try {
        // Build RFC 2822 email message
        const from = 'fabunmi.net@gmail.com';
        const fromName = senderName?.trim() || 'Shopify Partners Directory';
        const messageLines = [
          `From: ${fromName} <${from}>`,
          `To: ${user.email}`,
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

        if (response.ok) {
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Email blast sent to ${sentCount} users`,
      recipientCount: sentCount,
      failedCount: failedCount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});