// See https://kit.svelte.dev/docs/types#app

import type { AppRouter } from '$lib/server/trpc/routers/_app';
import type { User } from '@supabase/supabase-js';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}
		interface Locals {
			caller: ReturnType<AppRouter['createCaller']>;
			user: User | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
