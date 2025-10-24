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
	import { Button } from './ui/button';
	import { Badge } from './ui/badge';
	import { Plus, ThumbsDown, ThumbsUp } from '@lucide/svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
	import { Label } from './ui/label';
	import { Textarea } from './ui/textarea';

	interface Props {
		event: Event;
	}

	let { event } = $props();
	interface Decision {
		id: string;
		eventId: string;
		description: string;
		type: 'update_event' | 'propose_good' | 'allocate_good' | 'cancel_event';
		createdAt: string;
		createdBy: string;
		status: 'active' | 'approved' | 'rejected';
	}
	let decisions = $state<Decision[]>([]);
	let showCreateForm = $state(false);
	let newDecisionDescription = $state('');
	let newDecisionType = $state<Decision['type']>('update_event');

	const handleCreateDecision = () => {
		decisions.push({
			eventId: '',
			type: newDecisionType,
			description: newDecisionDescription,
			id: '',
			status: 'active',
			createdBy: '',
			createdAt: ''
		});
		newDecisionDescription = '';
		showCreateForm = false;
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Decisions & Voting</h3>
		{#if !showCreateForm}
			<Button size="sm" onclick={() => (showCreateForm = true)}>
				<Plus class="mr-2 h-4 w-4" />
				Propose Decision
			</Button>
		{/if}
	</div>

	{#if showCreateForm}
		<Card>
			<CardHeader>
				<CardTitle class="text-base">Create New Decision</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="decision-type">Decision Type</Label>
					<select
						id="decision-type"
						value={newDecisionType}
						onchange={(e) =>
							(newDecisionType = e.currentTarget.value as Decision['type'])}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<option value="update_event">Update Event</option>
						<option value="propose_good">Propose Good</option>
						<option value="allocate_good">Allocate Good</option>
						<option value="cancel_event">Cancel Event</option>
					</select>
				</div>

				<div class="space-y-2">
					<Label for="decision-description">Description</Label>
					<Textarea
						id="decision-description"
						placeholder="Describe the proposed decision..."
						value={newDecisionDescription}
						onchange={(e) => (newDecisionDescription = e.currentTarget.value)}
						rows={3}
					/>
				</div>

				<div class="flex gap-2">
					<Button
						onclick={handleCreateDecision}
						disabled={!newDecisionDescription.trim()}
					>
						Create Decision
					</Button>
					<Button variant="outline" onclick={() => (showCreateForm = false)}>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if decisions.length === 0 && !showCreateForm}
		<Card>
			<CardContent class="py-8 text-center text-muted-foreground">
				<p>No decisions yet. Members can propose decisions for this event.</p>
			</CardContent>
		</Card>
	{/if}

	{#each decisions as decision}
		<Card>
			<CardHeader>
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1">
						<div class="mb-2 flex items-center gap-2">
							<Badge variant="outline">{decision.type}</Badge>
							<Badge
								variant={decision.status === 'active'
									? 'default'
									: decision.status === 'approved'
										? 'default'
										: 'secondary'}
							>
								{decision.status}
							</Badge>
						</div>
						<CardDescription class="text-foreground"
							>{decision.description}</CardDescription
						>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div class="flex items-center gap-4 text-sm">
						<span class="text-muted-foreground">
							<span class="font-medium text-green-600">{6}</span> Yes
						</span>
						<span class="text-muted-foreground">
							<span class="font-medium text-red-600">{7}</span> No
						</span>
						<span class="text-muted-foreground">{41} total votes</span>
					</div>

					{#if decision.status === 'active'}
						<div class="flex gap-2">
							<Button size="sm" variant="outline">
								<ThumbsUp class="mr-2 h-4 w-4" />
								Vote Yes
							</Button>
							<Button size="sm" variant="outline">
								<ThumbsDown class="mr-2 h-4 w-4" />
								Vote No
							</Button>
						</div>
					{/if}

					{#if decision.status === 'active'}
						<p class="text-sm text-muted-foreground">
							Only members can vote on decisions
						</p>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/each}
</div>
