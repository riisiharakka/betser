import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://puzfettloxhfiuflxidp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1emZldHRsb3hoZml1Zmx4aWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4MDIwNDcsImV4cCI6MjAyMzM3ODA0N30.6oYiBSi7akOk_m8gN6P4ULTFtZfDdZtGbxJeMSfwLRs";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});