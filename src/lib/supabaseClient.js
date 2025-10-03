import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// create 2nd client for account creation
// create accounts using this client, to avoid staff session being logged out and new user logged in.
// https://www.reddit.com/r/Supabase/comments/18gomdr/current_user_session_gets_deleted_upon_signing_up/?scrlybrkr=dc0fd66d


export const supabaseB=createClient(
    PUBLIC_SUPABASE_URL, 
    PUBLIC_SUPABASE_ANON_KEY, 
    {"auth": 
        {"storageKey": "clientB"}
});