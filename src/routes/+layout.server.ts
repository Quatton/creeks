/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals: { getSession } }) => {
	return {
		session: await getSession()
	};
};
