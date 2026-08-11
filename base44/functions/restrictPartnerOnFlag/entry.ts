import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { waitUntil } from 'base44:runtime';

const REASON_LABELS = {
  spam: 'Spam or unsolicited content',
  fraud: 'Fraudulent or scam activity',
  inappropriate_content: 'Inappropriate content',
  misrepresentation: 'Misleading or false information',
  other: 'Other',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const flag = payload?.data || payload || {};
    const partnerId = flag.partner_id;
    if (!partnerId) return Response.json({ message: 'No partner_id in flag' });

    let partner;
    try {
      partner = await base44.asServiceRole.entities.Partner.get(partnerId);
    } catch {
      return Response.json({ message: 'Partner not found' });
    }

    const reasonText = REASON_LABELS[flag.reason] || flag.reason || 'A policy violation';
    const reportDetails = flag.details ? `\n\nReport details: "${flag.details}"` : '';

    // Bump the flag count; only auto-restrict once it reaches 3 reports
    const newFlagCount = (partner.flag_count || 0) + 1;
    const shouldRestrict = newFlagCount >= 3 && partner.status !== 'restricted';

    if (shouldRestrict) {
      await base44.asServiceRole.entities.Partner.update(partnerId, {
        status: 'restricted',
        restriction_reason: `Your account was reported 3 times. Latest reason: ${reasonText}. Submit an appeal from your profile to restore your account.`,
        flag_count: newFlagCount,
      });
    } else {
      await base44.asServiceRole.entities.Partner.update(partnerId, {
        flag_count: newFlagCount,
      });
    }

    // Only email the partner owner once the account is actually restricted
    if (shouldRestrict) {
      let toEmail = '';
      let ownerName = partner.name || 'Partner';
      try {
        const owner = await base44.asServiceRole.entities.User.get(partner.created_by_id);
        if (owner?.email) toEmail = owner.email;
        if (owner?.full_name) ownerName = owner.full_name;
      } catch {}

      if (toEmail) {
        const body = `Hi ${ownerName},\n\nYour partner account "${partner.name}" has been reported multiple times and automatically restricted.\n\nLatest reason: ${reasonText}${reportDetails}\n\nTo restore your account, log in to your profile and submit an appeal from the restriction banner. Once you submit your appeal, your account will be automatically restored.\n\nBest regards,\nShopify Partner Base Team`;
        waitUntil(base44.asServiceRole.integrations.Core.SendEmail({
          to: toEmail,
          subject: 'Your account has been restricted — submit an appeal',
          body,
        }));
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});