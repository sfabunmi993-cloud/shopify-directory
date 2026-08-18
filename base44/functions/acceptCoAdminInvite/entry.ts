import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invite_id } = await req.json();
    if (!invite_id) return Response.json({ error: 'Missing invite_id' }, { status: 400 });

    const sr = base44.asServiceRole.entities;
    const invite = await sr.CoAdminInvite.get(invite_id);
    if (!invite) return Response.json({ error: 'Invite not found' }, { status: 404 });
    if (invite.user_id !== user.id) return Response.json({ error: 'This invite belongs to another user' }, { status: 403 });
    if (invite.status !== 'pending') return Response.json({ error: `Invite already ${invite.status}` }, { status: 400 });

    // Promote the user to admin
    await sr.User.update(invite.user_id, { role: 'admin' });
    // Mark invite accepted
    await sr.CoAdminInvite.update(invite.id, { status: 'accepted' });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}