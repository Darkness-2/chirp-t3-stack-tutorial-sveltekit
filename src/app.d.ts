import '@total-typescript/ts-reset';
import type { AppRouter } from '$lib/server/trpc/routers/_app';
import type { User } from '@supabase/supabase-js';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}
		interface Locals {
			caller: ReturnType<AppRouter['createCaller']>;
			getUser: () => Promise<User | null>;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
