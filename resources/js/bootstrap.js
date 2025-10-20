/**
 *    SeUnem - A free software platform for participatory decision-making and
 *    collective event management.
 *    Copyright (C) 2025  João Augusto Costa Branco Marado Torres
 *    <torres.dev@disroot.org>
 *
 *    This file is part of SeUnem.
 *
 *    SeUnem is free software: you can redistribute it and/or modify it under
 *    the terms of the GNU Affero General Public License as published by the
 *    Free Software Foundation, either version 3 of the License, or (at your
 *    option) any later version.
 *
 *    SeUnem is distributed in the hope that it will be useful, but WITHOUT ANY
 *    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 *    FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
 *    more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with SeUnem.  If not, see <https://www.gnu.org/licenses/>
 */
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
