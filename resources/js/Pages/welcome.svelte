<script lang="ts">
	/**
	 *    SeUnem - A free software platform for participatory decision-making
	 *    and collective event management.
	 *    Copyright (C) 2025  João Augusto Costa Branco Marado Torres
	 *    <torres.dev@disroot.org>
	 *
	 *    This file is part of SeUnem.
	 *
	 *    SeUnem is free software: you can redistribute it and/or modify it
	 *    under the terms of the GNU Affero General Public License as published
	 *    by the Free Software Foundation, either version 3 of the License, or
	 *    (at your option) any later version.
	 *
	 *    SeUnem is distributed in the hope that it will be useful, but WITHOUT
	 *    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 *    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public
	 *    License for more details.
	 *
	 *    You should have received a copy of the GNU Affero General Public
	 *    License along with SeUnem.  If not, see
	 *    <https://www.gnu.org/licenses/>
	 */
	import Layout from '@/layouts/Layout.svelte';
	import { Calendar, FolderKanban } from '@lucide/svelte';
	import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
	import { inertia } from '@inertiajs/svelte';

	let { user } = $props();
</script>

<svelte:head>
	<title>Welcome</title>
</svelte:head>

<Layout>
	<div class="flex min-h-screen items-center justify-center bg-background p-4">
		<div class="w-full max-w-2xl">
			<header class="mb-12 text-center">
				<h1 class="mb-2 text-4xl font-bold text-foreground">Event Manager</h1>
				<p class="text-muted-foreground">Choose how you want to browse events</p>
			</header>

			<div class="grid gap-6 md:grid-cols-2">
				<a use:inertia href="/events" class="group">
					<Card class="h-full transition-colors hover:border-primary">
						<CardHeader class="text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
							>
								<Calendar class="h-8 w-8 text-primary" />
							</div>
							<CardTitle>List Events</CardTitle>
							<CardDescription>View all events in chronological order</CardDescription
							>
						</CardHeader>
					</Card>
				</a>

				<a use:inertia href="/event-groups" class="group">
					<Card class="h-full transition-colors hover:border-primary">
						<CardHeader class="text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
							>
								<FolderKanban class="h-8 w-8 text-primary" />
							</div>
							<CardTitle>Browse by Groups</CardTitle>
							<CardDescription>Filter events by categories and tags</CardDescription>
						</CardHeader>
					</Card>
				</a>
			</div>
		</div>
	</div>
</Layout>
