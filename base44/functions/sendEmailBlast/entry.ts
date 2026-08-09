import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, body, recipients, senderName, senderEmail } = await req.json();
    void senderEmail;
    
    if (!subject || !body) {
      return Response.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Determine recipient list
    let emailList = [];
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      // Use provided list of email strings
      emailList = recipients.filter(e => typeof e === 'string' && e.includes('@'));
    } else {
      // Fall back to all registered users
      const allUsers = await base44.asServiceRole.entities.User.filter({});
      emailList = allUsers.map(u => u.email).filter(Boolean);
    }
    
    if (emailList.length === 0) {
      return Response.json({ error: 'No recipients found' }, { status: 404 });
    }

    let sentCount = 0;
    let failedCount = 0;

    const fromName = senderName?.trim() || 'Shopify Partners Directory';

    // Send via the connected Gmail account so the blast reaches every recipient's Gmail inbox
    const token = await base44.asServiceRole.connectors.getConnection('gmail');
    const fromAddress = senderEmail?.trim() || 'fabunmi.net@gmail.com';

    const buildRaw = (to: string) => {
      const headers = [
        `From: ${fromName} <${fromAddress}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        body,
      ].join('\r\n');
      // Base64url-encode the UTF-8 RFC822 message
      const b64 = btoa(unescape(encodeURIComponent(headers)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const sendOne = async (to: string) => {
      try {
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: buildRaw(to) }),
        });
        if (!res.ok) throw new Error(`Gmail API ${res.status}`);
        sentCount++;
      } catch (err) {
        failedCount++;
      }
    };

    // Send in small parallel batches to stay within Gmail rate limits
    const batchSize = 8;
    for (let i = 0; i < emailList.length; i += batchSize) {
      await Promise.all(emailList.slice(i, i + batchSize).map(sendOne));
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