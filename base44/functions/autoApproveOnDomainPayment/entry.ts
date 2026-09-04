import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    // Trust only the database: resolve the payment record referenced by the trigger.
    const paymentId = body?.event?.entity_id || body?.data?.id;
    if (!paymentId) return Response.json({ skipped: true, reason: 'no payment reference' });
    let payment;
    try {
      payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    } catch {
      return Response.json({ skipped: true, reason: 'payment not found' });
    }
    if (!(payment.description || '').includes('Domain Purchase')) {
      return Response.json({ skipped: true, reason: 'not a domain purchase' });
    }
    if (!payment.partner_id) {
      return Response.json({ skipped: true, reason: 'no partner_id' });
    }
    await base44.asServiceRole.entities.Partner.update(payment.partner_id, { status: 'approved' });
    return Response.json({ success: true, partner_id: payment.partner_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});