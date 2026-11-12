/* The database connection, in the code rather than in environment settings.
 *
 * Both values below are public by design: the project URL is visible in every
 * request a student's browser makes, and the publishable key is the anon key
 * Supabase hands to the browser on purpose. What protects the table is the
 * row-level security policy in the setup SQL, not the secrecy of these.
 *
 * The admin password is NOT here. It is typed on /admin, kept in memory for the
 * session and sent with each write, where the policy checks it. */

export const SUPABASE_URL = 'https://wcfzkiplcujrqkwpxqts.supabase.co'

export const SUPABASE_KEY = 'sb_publishable_kwwDA13z7mKu9uYArzWvKQ_t62Jnrx1'
