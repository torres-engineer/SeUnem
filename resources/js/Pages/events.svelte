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
	import { ArrowLeft, Calendar, MapPin, Users, Clock, Tag, Plus, X } from '@lucide/svelte';
	import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
	import { inertia } from '@inertiajs/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { CardContent } from '$lib/components/ui/card';
	import EventDialog from '$lib/components/event_dialog.svelte';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	type Event = {
		tags: string[];
	};

	interface Props {
		events: Event[];
		tags: string[];
	}

	let { events, tags } = $props();
	let selectedEvent = $state<Event | null>(null);
	let base = window.location.href;
	let open = $state(false);
</script>

<svelte:head>
	<title>Events</title>
</svelte:head>

<Layout>
	<div class="min-h-screen bg-background">
		<div class="container mx-auto max-w-4xl px-4 py-8">
			<div class="mb-6 flex items-center justify-between">
				<a use:inertia href="/">
					<Button variant="ghost" size="sm">
						<ArrowLeft class="mr-2 h-4 w-4" />
						Back to Home
					</Button>
				</a>

				<Button onclick={() => (open = true)}>
					<Plus class="mr-2 h-4 w-4" />
					Create Event
				</Button>
			</div>

			<header class="mb-8">
				<h1 class="mb-2 text-4xl font-bold text-foreground">All Events</h1>
				<p class="text-muted-foreground">Browse all events chronologically</p>
			</header>

			{#if tags.length > 0}
				<div class="mb-4 grid gap-4 sm:grid-cols-3 md:grid-cols-4">
					{#each tags as tag}
						<a use:inertia href={`${base}&tags[]=${tag.name}`}>
							<Card class="transition-colors hover:border-primary">
								<CardHeader>
									<div class="mb-2 flex items-start justify-between gap-2">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
										>
											<Tag class="h-5 w-5 text-primary" />
										</div>
									</div>
									<CardTitle class="text-lg">{tag.name}</CardTitle>
								</CardHeader>
							</Card>
						</a>
					{/each}
				</div>
			{/if}

			<div class="space-y-4">
				{#each events as event}
					<Card
						class="cursor-pointer transition-colors hover:border-primary"
						onclick={() => (selectedEvent = event)}
					>
						<CardHeader>
							<div class="flex items-start justify-between gap-4">
								<CardTitle>{event.title}</CardTitle>
								<Badge
									variant={event.status === 'upcoming'
										? 'default'
										: event.status === 'completed'
											? 'secondary'
											: 'destructive'}
								>
									{event.status}
								</Badge>
							</div>
							<CardDescription>{event.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
								<span class="flex items-center gap-1.5">
									<Calendar class="h-4 w-4" />
									{new Date(event.start).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric'
									})}
								</span>
								<span class="flex items-center gap-1.5">
									<Clock class="h-4 w-4" />
									{new Date(event.start).toLocaleTimeString('en-US', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</span>
								<span class="flex items-center gap-1.5">
									<MapPin class="h-4 w-4" />
									{event.location.name}
								</span>
								<span class="flex items-center gap-1.5">
									<Users class="h-4 w-4" />
									{event.memberCount} members · {event.followerCount} followers
								</span>
							</div>

							<div class="flex flex-wrap gap-2">
								{#each event.tags as tag}
									<Badge variant="outline">
										{tag.name}
									</Badge>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>

		{#if selectedEvent}
			<EventDialog event={selectedEvent} onClose={() => (selectedEvent = null)} />
		{/if}
	</div>

	<Dialog {open} onOpenChange={(x) => (open = x)}>
		<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
			<DialogHeader>
				<DialogTitle>Create New Event</DialogTitle>
				<DialogDescription>Fill in the details to create a new event</DialogDescription>
			</DialogHeader>
			<form onsubmit={(e) => e.preventDefault()} class="space-y-4">
				<div class="space-y-2">
					<Label for="title">Event Title</Label>
					<Input id="title" placeholder="Community Tech Workshop" required />
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						placeholder="Describe your event..."
						required
						rows={3}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="start">Start Date & Time</Label>
						<Input id="start" type="datetime-local" required />
					</div>
					<div class="space-y-2">
						<Label for="end">End Date & Time</Label>
						<Input id="end" type="datetime-local" required />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="location">Location</Label>
					<select
						id="location"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						required
					>
						<option>A</option>
						<option>B</option>
						<option>C</option>
					</select>
				</div>

				<div class="space-y-2">
					<Label>Tags</Label>
					<div class="flex flex-wrap gap-2">
						<Badge variant="default" class="cursor-pointer">
							tag name
							<X class="ml-1 h-3 w-3" />
						</Badge>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-4">
					<Button type="button" variant="outline" onclick={() => (open = false)}>
						Cancel
					</Button>
					<Button type="submit">Create Event</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>
</Layout>
