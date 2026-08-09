import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { waitUntil } from 'base44:runtime';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const appealText = (body?.appealText || '').trim();
    if (!appealText) return Response.json({ error: 'Appeal text is required' }, { status: 400 });

    const partners = await base44.entities.Partner.filter({ created_by_id: user.id });
    const partner = partners?.[0];
    if (!partner) return Response.json({ error: 'No partner profile found' }, { status: 404 });
    if (partner.status !== 'restricted') return Response.json({ error: 'Account is not restricted' }, { status: 400 });

    const previousReason = partner.restriction_reason || 'N/A';

    // Auto-approve the partner back
    await base44.entities.Partner.update(partner.id, {
      status: 'approved',
      restriction_reason: '',
    });

    // Confirm to the partner owner
    let toEmail = user.email || '';
    const ownerName = partner.name || user.full_name || 'Partner';
    if (toEmail) {
      waitUntil(base44.asServiceRole.integrations.Core.SendEmail({
        to: toEmail,
        subject: 'Your appeal has been received — account restored',
        body: `Hi ${ownerName},\n\nYour appeal has been received and your partner account "${partner.name}" has been automatically restored.\n\nYour appeal:\n"${appealText}"\n\nYour profile is live again in the directory. Thank you.\n\nBest regards,\nShopify Partner Base Team`,
      }));
    }

    // Notify admins of the appeal
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      const adminEmails = (admins || []).map((a) => a.email).filter(Boolean);
      if (adminEmails.length) {
        waitUntil(Promise.all(adminEmails.map((email) =>
          base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `Appeal submitted by ${partner.name}`,
            body: `Partner "${partner.name}" submitted an appeal and their account has been automatically restored.\n\nAppeal:\n"${appealText}"\n\nPrevious restriction reason: ${previousReason}`,
          })
        )));
      }
    } catch {}

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});