import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmqgremvjkooevqpomuj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0W27A3dy1sa7zsSG8vZjZw_lTm26tFA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);