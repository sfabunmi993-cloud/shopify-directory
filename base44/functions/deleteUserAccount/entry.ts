import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const uid = user.id;
    const sr = base44.asServiceRole.entities;

    // Partners owned by the user: purge their reviews, then the partner record
    const partners = await sr.Partner.filter({ created_by_id: uid });
    for (const p of partners) {
      await sr.Review.deleteMany({ partner_id: p.id });
      await sr.Partner.delete(p.id);
    }

    // Reviews authored by the user
    await sr.Review.deleteMany({ created_by_id: uid });

    // Favorites
    await sr.Favorite.deleteMany({ user_id: uid });

    // Messages where the user is involved
    await sr.Message.deleteMany({ sender_id: uid });
    await sr.Message.deleteMany({ client_user_id: uid });
    await sr.Message.deleteMany({ partner_user_id: uid });

    // Projects
    await sr.Project.deleteMany({ client_user_id: uid });
    await sr.Project.deleteMany({ created_by_id: uid });

    // Direct messages
    await sr.DirectMessage.deleteMany({ sender_id: uid });
    await sr.DirectMessage.deleteMany({ recipient_id: uid });

    // Flags submitted by the user
    await sr.Flag.deleteMany({ reporter_id: uid });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}