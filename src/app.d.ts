// See https://kit.svelte.dev/docs/types#app

import type { AppRouter } from '$lib/server/trpc/routers/_app';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}
		interface Locals {
			caller: ReturnType<AppRouter['createCaller']>;
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
		// interface Platform {}
	}
}

export {};
