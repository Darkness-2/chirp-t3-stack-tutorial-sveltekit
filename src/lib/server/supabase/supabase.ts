import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

export const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

export const getUser = async (accessToken: string) => {
	// If there is no access token, no need to even check Supabase
	if (accessToken === '') {
		return null;
	}

	const {
		data: { user }
	} = await supabaseAdminClient.auth.getUser(accessToken);

	return user;
};
