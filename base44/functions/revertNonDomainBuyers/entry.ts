import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Automatic partner revert is intentionally disabled.
// Approved partners are no longer auto-reverted to pending for not purchasing a domain.
Deno.serve(async (_req) => {
  return new Response(
    JSON.stringify({
      success: true,
      skipped: true,
      message: 'Automatic partner revert is disabled',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});