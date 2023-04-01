import clerkClient from '@clerk/clerk-sdk-node';

export const authenticateSession = async (sessionCookie: string) => {
	try {
		const client = await clerkClient.clients.verifyClient(sessionCookie);
		const sessionId = client.lastActiveSessionId ?? '';
		const session = await clerkClient.sessions.verifySession(sessionId, sessionCookie);
		return session;
	} catch (e) {
		return null;
	}
};
