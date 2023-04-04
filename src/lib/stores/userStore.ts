import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient, SupabaseClient, type User } from '@supabase/supabase-js';
import { readable } from 'svelte/store';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

type UserStore = {
	supabase: SupabaseClient;
	user: User | null;
};

export const userStore = readable<UserStore>(
	{
		supabase,
		user: null
	},
	(set) => {
		/**
		 * Gets the user's auth status as determined by Supabase.
		 * Stores or deletes a local cookie based on the event Supabase returns.
		 *
		 * See https://supabase.com/docs/guides/auth/server-side-rendering
		 */
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			console.log('Supabase Auth state changed:', event);

			if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
				const expires = new Date(0).toUTCString();
				document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
				document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
			} else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
				const maxAge = ONE_DAY_IN_SECONDS;
				document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
				document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
			}

			set({
				supabase,
				user: session?.user ?? null
			});
		});

		return () => subscription.unsubscribe();
	}
);
