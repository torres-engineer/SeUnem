import axios from 'axios';
import { createInertiaApp } from '@inertiajs/svelte';
import { hydrate, mount } from 'svelte';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

createInertiaApp({
	resolve: (name) =>
		resolvePageComponent(
			`./Pages/${name}.svelte`,
			import.meta.glob('./Pages/**/*.svelte', { eager: true })
		),
	setup({ el, App, props }) {
		if (el.dataset.serverRendered === 'true') {
			hydrate(App, { target: el, props });
		} else {
			mount(App, { target: el, props });
		}
	}
});
