import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuuepzaquyszjxephjwf.supabase.co';

const supabaseAnonKey = 'sb_publishable_-sgBnMajXPX9gRzhCEvl8w_XQmvyu3i';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
