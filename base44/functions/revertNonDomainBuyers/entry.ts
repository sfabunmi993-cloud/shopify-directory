import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const GRACE_MINUTES = 0;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const [partners, payments] = await Promise.all([
      base44.asServiceRole.entities.Partner.list('-updated_date', 500),
      base44.asServiceRole.entities.Payment.list('-created_date', 500),
    ]);

    // Partner IDs that have a domain-purchase payment (pending or approved; rejected doesn't count)
    const domainPaid = new Set(
      payments
        .filter((p) => p.status !== 'rejected' && (p.description || '').includes('Domain Purchase'))
        .map((p) => p.partner_id)
        .filter(Boolean)
    );

    // Also protect partners manually marked as domain-purchased
    for (const p of partners) {
      if (p.domain_purchased) domainPaid.add(p.id);
    }

    const cutoff = Date.now() - GRACE_MINUTES * 60 * 1000;
    const toRevert = partners.filter(
      (p) =>
        p.status === 'approved' &&
        !domainPaid.has(p.id) &&
        p.updated_date &&
        new Date(p.updated_date).getTime() < cutoff
    );

if (toRevert.length > 0) {
  await base44.asServiceRole.entities.Partner.bulkUpdate(
    toRevert.map((p) => ({ id: p.id, status: 'pending' }))
  );
}

    return Response.json({
      success: true,
      reverted: toRevert.length,
      reverted_ids: toRevert.map((p) => p.id),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});