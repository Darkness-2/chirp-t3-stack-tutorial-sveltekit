# SvelteKit T3 App Example

This is an adaptation of the [T3 Stack](https://create.t3.gg/) that uses [SvelteKit](https://kit.svelte.dev/) instead of Next.js. Specifically, this is a SvelteKit clone of [Theo's (t3dotgg) example Chirp app](https://github.com/t3dotgg/chirp).

You can check out the live version of it [here](https://chirp-t3-stack-tutorial-sveltekit.vercel.app/).

I'd love to collaborate on this if anyone has recommendations!

---

## What's different about this implementation?

I tried to keep this project as similar as possible to the Chirp example, but there are a few key areas of difference:

- Using SvelteKit instead of Next.js (obviously)
- Using Supabase Auth instead of Clerk [(see note)](#using-supabase-auth)
- Has to use vanilla tRPC libraries

I tried to keep the implementation of tRPC and Prisma as close as possible to T3 stack. For tRPC, there are a few key differences, as SvelteKit doesn't have a specific tRPC library like @trpc/next.

A few notes on the tRPC implementation:

- Uses the tRPC fetch adapter in SvelteKit's `hooks.server.ts` file to respond to requests to /api/trpc
- Uses Tanstack Query to query the tRPC functions on the client
  - I found this to be 99% as good as the implementation available for Next.js; the only flaw I found was you don't get automatic error types (I solved this through a type guard helper function for tRPC client errors)
- Doesn't use the [SSG helpers](https://trpc.io/docs/nextjs/ssg-helpers) as these are only available for Next.js
  - Instead, I opted to use SvelteKit's `+page.server.ts` load function to fetch data for the user profile and post pages
  - For these pages, I also implemented caching using `cache-control` headers and Vercel's [ISR capabilities](https://vercel.com/docs/concepts/incremental-static-regeneration/overview), which provides a pretty similar result to SSG
- I attached a [server-side caller](https://trpc.io/docs/server/server-side-calls) to `event.locals`, which allows you to interact with tRPC functions within SvelteKit server-side functions like `+page.server.ts` or `+layout.server.ts` without making an unnecessary request
- I wanted to avoid using [trpc-sveltekit](https://www.npmjs.com/package/trpc-sveltekit) to avoid introducing another dependency, and because the tRPC implementation for SvelteKit is not too challenging
  - That being said they have some great documentation on using tRPC in SvelteKit and I highly recommend checking it out!

---

## The stack

The stack used for this project is mostly the same as in the original Chirp example:

- [SvelteKit](https://kit.svelte.dev/)
- [Vercel](https://vercel.com/)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Tanstack Query](https://tanstack.com/query/v4/docs/svelte/overview) for client-side data fetching
- [Zod](https://zod.dev/) for validation
- [Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/sveltekit) [(see note)](#using-supabase-auth)
  - Specifically the SvelteKit auth helpers
- [Upstash](https://upstash.com/) for rate limiting
- [Sentry](https://sentry.io/) for error tracking

---

## Data fetching with SvelteKit

One of the great features of SvelteKit is the flexibilty in how you can load data into your pages and layouts. Adding in tRPC just adds even more flexibility. Here's a (non-exhaustive) list of data fetching methods you could use within this project:

- Using Tanstack Query to wrap your tRPC client and make calls client-side
  - This is the method I used in this project, partly to match the original Next.js example, but also because it adds so much to the experience (cached data, automatic retry on error, refetch on refocus, and tons more)
- Using `+page.server.ts` load functions to call tRPC functions server-side
  - I used this method for the profile and post pages as it makes sense to not even load these pages unless the data is available
  - It also makes caching easier as you can both set `cache-control` headers within load functions and use [`adapter-vercel`](https://kit.svelte.dev/docs/adapter-vercel) to configure these functions with ISR or edge deployments
- Combining the above two methods by using [Tanstack Query's SSR features](https://tanstack.com/query/latest/docs/svelte/ssr)
- Using the tRPC client directly in pages and components using Svelte's `{#await}` syntax
- Using `+page.server.ts` load functions to make Prisma queries directly
- Using [SvelteKit actions](https://kit.svelte.dev/docs/form-actions) to make tRPC calls (via the server-side caller) or make Prisma queries directly
- Using `+page.ts` load functions to make calls to external services
  - Note, it doesn't make much sense to do this with the tRPC client as:
    - a) the tRPC client is going to make a request to the server anyways
    - b) `+page.ts` load functions can still run server-side, in which case using the server-side caller is a much better approach to avoid an unnecessary request

---

## Using Supabase Auth

I originally tried implementing this project with [Clerk auth](https://clerk.com/), as in the original Chirp example. However, they don't have a SvelteKit integration. I didn't think this would be a problem as I thought I could find a way to use their vanilla JS and Node SDKs. However, I found [Clerk's documentation](https://clerk.com/docs/reference/node/getting-started) for these SDKs a bit challenging, and might revisit this in the future.

Key differences I found with using Supabase:

- The [Supabase Admin API](https://supabase.com/docs/reference/javascript/admin-api) seems less designed to query user data than Clerk (for example, there is no `getUserList` equivalent)
  - As Supabase doesn't have a way to query users by username, I had to use userIds as the slug for the profile page
- Supabase also doesn't provide as easy access to provider data, like the user's Github profile picture and username as Clerk does
  - To get around this, I built a Zod validator that adds type safety for Github user data available under Supabase's `user_metadata` object (see `/src/lib/helpers/userData.ts`)
- The Supabase server-side auth helpers seem to set a cookie on every response back from the server, even if the auth state hasn't changed; I had to remove the `set-cookie` header for responses I wanted to be cached by Vercel, as otherwise that would leak user session tokens
