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
	import { Calendar, Clock, Heart, MapPin, UserMinus, UserPlus, Users, X } from '@lucide/svelte';
	import { Button } from './ui/button';
	import { Badge } from './ui/badge';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
	import DecisionsSection from './decisions_section.svelte';
	import GoodsSection from './goods_section.svelte';

	interface Props {
		event: Event;
		onClose: () => void;
	}

	let { event, onClose } = $props();
	let isMember = $state(false);
	let isFollowing = $state(false);

	const handleJoin = () => {
		isMember = true;
		isFollowing = true;
	};
	const handleLeave = () => {
		isMember = false;
		isFollowing = false;
	};
	const handleFollow = () => {
		isFollowing = true;
	};
	const handleUnfollow = () => {
		isFollowing = false;
	};
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
>
	<div
		class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
	>
		<div
			class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4"
		>
			<h2 class="text-2xl font-bold text-foreground">Event Details</h2>
			<Button variant="ghost" size="icon" onclick={onClose} class="shrink-0">
				<X class="h-5 w-5" />
			</Button>
		</div>

		<div class="p-6">
			<Tabs value="details" class="w-full">
				<TabsList class="mb-6 grid w-full grid-cols-3">
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="decisions">Decisions</TabsTrigger>
					<TabsTrigger value="goods">Goods</TabsTrigger>
				</TabsList>

				<TabsContent value="details" class="space-y-6">
					<div>
						<div class="mb-4 flex items-start justify-between gap-4">
							<h3 class="text-xl font-semibold text-foreground">{event.title}</h3>
							<Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}
								>{event.status}</Badge
							>
						</div>
						<p class="leading-relaxed text-muted-foreground">{event.description}</p>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="flex items-center gap-3 rounded-lg bg-muted p-4">
							<Calendar class="h-5 w-5 text-primary" />
							<div>
								<p
									class="mb-1 text-xs tracking-wide text-muted-foreground uppercase"
								>
									Date
								</p>
								<p class="text-sm font-medium text-foreground">
									{new Date(event.start).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
										year: 'numeric'
									})}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3 rounded-lg bg-muted p-4">
							<Clock class="h-5 w-5 text-primary" />
							<div>
								<p
									class="mb-1 text-xs tracking-wide text-muted-foreground uppercase"
								>
									Time
								</p>
								<p class="text-sm font-medium text-foreground">
									{new Date(event.start).toLocaleTimeString('en-US', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3 rounded-lg bg-muted p-4">
							<MapPin class="h-5 w-5 text-primary" />
							<div>
								<p
									class="mb-1 text-xs tracking-wide text-muted-foreground uppercase"
								>
									Location
								</p>
								<p class="text-sm font-medium text-foreground">
									{event.location?.name}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3 rounded-lg bg-muted p-4">
							<Users class="h-5 w-5 text-primary" />
							<div>
								<p
									class="mb-1 text-xs tracking-wide text-muted-foreground uppercase"
								>
									Members
								</p>
								<p class="text-sm font-medium text-foreground">
									{event.memberCount} members · {event.followerCount} followers
								</p>
							</div>
						</div>
					</div>

					<div>
						<p class="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
							Tags
						</p>
						<div class="flex flex-wrap gap-2">
							{#each event.tags as tag}
								<Badge variant="outline">
									{tag.name}
								</Badge>
							{/each}
						</div>
					</div>

					<div class="flex gap-3 pt-4">
						{#if isMember}
							<Button variant="destructive" class="flex-1" onclick={handleLeave}>
								<UserMinus class="mr-2 h-4 w-4" />
								Leave Event
							</Button>
						{:else}
							<Button class="flex-1" onclick={handleJoin}>
								<UserPlus class="mr-2 h-4 w-4" />
								Join Event
							</Button>
						{/if}

						{#if !isMember}
							{#if isFollowing}
								<Button
									variant="outline"
									class="flex-1 bg-transparent"
									onclick={handleUnfollow}
								>
									<Heart class="mr-2 h-4 w-4 fill-current" />
									Unfollow
								</Button>
							{:else}
								<Button
									variant="outline"
									class="flex-1 bg-transparent"
									onclick={handleFollow}
								>
									<Heart class="mr-2 h-4 w-4" />
									Follow
								</Button>
							{/if}
						{/if}
					</div>

					<div class="rounded-lg bg-muted p-4 text-center">
						<p class="text-sm text-muted-foreground">
							Please login to join or follow this event
						</p>
					</div>
				</TabsContent>

				<TabsContent value="decisions">
					<DecisionsSection eventId={event.id} />
				</TabsContent>

				<TabsContent value="goods">
					<GoodsSection eventId={event.id} />
				</TabsContent>
			</Tabs>
		</div>
	</div>
</div>
