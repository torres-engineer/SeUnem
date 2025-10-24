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
	import { ArrowLeft, Tag } from '@lucide/svelte';
	import { Card, CardHeader, CardTitle } from '@/components/ui/card';
	import { inertia } from '@inertiajs/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		availableGroups: { name: string; count: number };
	}

	let { availableGroups } = $props();
	let selectedEvent = $state<Event | null>(null);
</script>

<svelte:head>
	<title>Events</title>
</svelte:head>

<Layout>
	<div class="min-h-screen bg-background">
		<div class="container mx-auto max-w-4xl px-4 py-8">
			<a use:inertia href="/">
				<Button variant="ghost" size="sm" class="mb-6">
					<ArrowLeft class="mr-2 h-4 w-4" />
					Back to Home
				</Button>
			</a>

			<header class="mb-8">
				<h1 class="mb-2 text-4xl font-bold text-foreground">Event Groups</h1>
				<p class="text-muted-foreground">Select a group to filter events</p>
			</header>

			<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
				{#each availableGroups as group}
					<a use:inertia href={`/events?tags[]=${group.name}`}>
						<Card class="transition-colors hover:border-primary">
							<CardHeader>
								<div class="mb-2 flex items-start justify-between gap-2">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
									>
										<Tag class="h-5 w-5 text-primary" />
									</div>
									<Badge variant="secondary">{group.count}</Badge>
								</div>
								<CardTitle class="text-lg">{group.name}</CardTitle>
							</CardHeader>
						</Card>
					</a>
				{/each}
			</div>
		</div>
	</div>
</Layout>
