// See https://kit.svelte.dev/docs/types#app

import type { AppRouter } from '$lib/server/trpc/routers/_app';
import type { Session } from '@clerk/clerk-sdk-node';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			caller: ReturnType<AppRouter['createCaller']>;
			session: Session | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
