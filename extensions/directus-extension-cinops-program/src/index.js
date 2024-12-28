import Cinops from './cinops.vue';


export default {
	id: 'cinops-program',
	name: 'Programmation',
	icon: 'calendar_month',
	routes: [
		{
			path: '',
			component: Cinops,
		},
		{
			name: 'theater',
			path: ':theater',
			props: true,
			component: Cinops,
		},
	],
};
