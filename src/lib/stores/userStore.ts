import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { readable, type Readable } from 'svelte/store';
import Cookies, { type CookieAttributes } from 'js-cookie';
import { browser } from '$app/environment';
import { getContext } from 'svelte';

/**
 * User store where the user's Supabase auth status will be stored.
 * isLoading represents whether the Supabase auth state hook has managed to run yet.
 * supabase gives access to the Supabase client.
 * user provides the user object, if logged in.
 */
export type UserStore =
	// Server state
	| {
			isLoading: true;
			supabase: null;
			user: null;
	  }
	// Client state while loading
	| {
			isLoading: true;
			supabase: SupabaseClient;
			user: null;
	  }
	// Client state after loading
	| {
			isLoading: false;
			supabase: SupabaseClient;
			user: User | null;
	  };

/**
 * Helper funciton to create a userStore.
 * Ensures stores are unique per request.
 * See https://kit.svelte.dev/docs/state-management#using-stores-with-context
 */
export const createUserStore = () => {
	const supabase = browser ? createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY) : null;

	return readable<UserStore>(
		{
			isLoading: true,
			supabase,
			user: null
		},
		(set) => {
			// If on server, don't bother running supabase auth hook
			if (!browser || !supabase) return;

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
					Cookies.remove('sb-access-token');
					Cookies.remove('sb-refresh-token');
				} else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
					const cookieSettings: CookieAttributes = {
						expires: 1,
						path: '/',
						sameSite: 'Lax',
						secure: true
					};

					Cookies.set('sb-access-token', session.access_token, cookieSettings);
					Cookies.set('sb-refresh-token', session.refresh_token, cookieSettings);
				}

				set({
					isLoading: false,
					supabase,
					user: session?.user ?? null
				});
			});

			return () => subscription.unsubscribe();
		}
	);
};

/**
 * Helper function to get the userStore with type safety.
 */
export const getUserStore = () => {
	return getContext<Readable<UserStore>>('userStore');
};
