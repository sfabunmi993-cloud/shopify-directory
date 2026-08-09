import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmails = (admins || []).map((a) => a.email).filter(Boolean);
    if (!adminEmails.length) {
      return Response.json({ error: 'No admin available to receive messages' }, { status: 404 });
    }

    await Promise.all(adminEmails.map((to) =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: `Contact Form: ${name}`,
        body: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        from_name: 'Contact Form',
      })
    ));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});