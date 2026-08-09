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

    for (const email of emailList) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          body,
          from_name: fromName,
        });
        sentCount++;
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