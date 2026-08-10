import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const payment = body?.data;
    if (!payment) return Response.json({ skipped: true, reason: 'no data' });
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