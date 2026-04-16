import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const validPlans = ['basic', 'pro'];

	if (!validPlans.includes(params.plan)) {
		throw error(404, 'Plan not found');
	}

	return {
		plan: params.plan
	};
};
