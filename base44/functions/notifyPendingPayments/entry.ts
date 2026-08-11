import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Fetch all pending payments (service role reads all records)
    const payments = await base44.asServiceRole.entities.Payment.filter({ status: 'pending' });

    // Keep only those older than 48h, not yet reminded, and with a contact email
    const overdue = payments.filter((p) =>
      p.created_date &&
      new Date(p.created_date) <= fortyEightHoursAgo &&
      !p.pending_reminder_sent &&
      p.user_email
    );

    if (overdue.length === 0) {
      return Response.json({ success: true, notified: 0, message: 'No overdue pending payments.' });
    }

    // Get Gmail access token (connector already authorized)
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    let notified = 0;
    for (const payment of overdue) {
      const subject = '⏳ Action Needed: Your Payment is Still Pending';
      const body = `Dear ${payment.user_name || 'Valued Partner'},

Our records show that your payment for ${payment.description || 'your purchase'} ($${payment.amount?.toLocaleString() || 'N/A'}) submitted on ${new Date(payment.created_date).toLocaleDateString()} is still pending verification.

It has been over 48 hours since submission. To avoid delays, please confirm your payment was completed and that any required payment screenshot/proof has been uploaded.

If you have already completed the payment and uploaded proof, no further action is needed — our team will review it shortly.

Need help? Reach out to our support team.

Best regards,
Shopify Partners Directory Team`;

      const messageLines = [
        'From: Shopify Partners Directory',
        `To: ${payment.user_email}`,
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

      try {
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        });

        if (response.ok) {
          await base44.asServiceRole.entities.Payment.update(payment.id, { pending_reminder_sent: true });
          notified++;
        }
      } catch (err) {
        // Skip this payment and continue with the rest
      }
    }

    return Response.json({
      success: true,
      notified,
      totalOverdue: overdue.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});