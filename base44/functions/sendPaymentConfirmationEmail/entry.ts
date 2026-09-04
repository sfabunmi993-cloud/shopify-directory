import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userEmail, userName, paymentType, amount } = await req.json();
    
    if (!userEmail || !paymentType) {
      return Response.json({ error: 'User email and payment type are required' }, { status: 400 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    // Build email subject and body based on payment type
    const subject = paymentType.includes('Premium Badge') 
      ? '✅ Premium Badge Purchase Approved'
      : '✅ Review Package Purchase Approved';
    
    const body = `Dear ${userName || 'Valued Partner'},

Congratulations! Your payment for ${paymentType} has been approved.

Payment Details:
- Amount: $${amount?.toLocaleString() || 'N/A'}
- Status: Approved
- Date: ${new Date().toLocaleDateString()}

Your account has been updated with the new features. You can now enjoy the benefits of your purchase!

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
Shopify Partners Directory Team`;

    // Build RFC 2822 email message
    const from = 'Shopify Partners Directory';
    const messageLines = [
      `From: ${from}`,
      `To: ${userEmail}`,
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
      message: 'Confirmation email sent successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});