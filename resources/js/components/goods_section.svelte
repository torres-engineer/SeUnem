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
	import { ArrowRightLeft, Package, Plus } from '@lucide/svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
	import { Label } from './ui/label';
	import { Textarea } from './ui/textarea';
	import { Input } from './ui/input';

	interface Good {
		id: string;
		name: string;
		description: string;
		eventId: string;
		ownerId?: string;
		createdAt: string;
	}
	let goods = $state<Good[]>([]);
	let showCreateForm = $state(false);
	let newGoodName = $state('');
	let newGoodDescription = $state('');
	let transferGoodId = $state<string | null>('');
	let transferToUserId = $state<string | null>('');

	const handleCreateGood = () => {
		goods.push({
			name: newGoodName,
			description: newGoodDescription,
			id: '',
			eventId: '',
			createdAt: ''
		});
		newGoodName = '';
		newGoodDescription = '';
		showCreateForm = false;
	};

	const handleTransferGood = () => {
		if (!transferToUserId) return;

		transferGoodId = null;
		transferToUserId = '';
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Goods & Resources</h3>
		{#if !showCreateForm}
			<Button size="sm" onclick={() => (showCreateForm = true)}>
				<Plus class="mr-2 h-4 w-4" />
				Add Good
			</Button>
		{/if}
	</div>

	{#if showCreateForm}
		<Card>
			<CardHeader>
				<CardTitle class="text-base">Add New Good</CardTitle>
				<CardDescription>Add a resource or good needed for this event</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="good-name">Name</Label>
					<Input
						id="good-name"
						placeholder="e.g., Projector, Chairs, Food"
						value={newGoodName}
						onchange={(e) => (newGoodName = e.currentTarget.value)}
					/>
				</div>

				<div class="space-y-2">
					<Label for="good-description">Description</Label>
					<Textarea
						id="good-description"
						placeholder="Describe the good or resource..."
						value={newGoodDescription}
						onchange={(e) => (newGoodDescription = e.currentTarget.value)}
						rows={3}
					/>
				</div>

				<div class="flex gap-2">
					<Button onclick={handleCreateGood} disabled={!newGoodName.trim()}>
						Add Good
					</Button>
					<Button variant="outline" onclick={() => (showCreateForm = false)}>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if goods.length === 0 && !showCreateForm}
		<Card>
			<CardContent class="py-8 text-center text-muted-foreground">
				<Package class="mx-auto mb-3 h-12 w-12 opacity-50" />
				<p>No goods or resources yet. Members can add items needed for this event.</p>
			</CardContent>
		</Card>
	{/if}

	<div class="grid gap-4">
		{#each goods as good}
			<Card>
				<CardHeader>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<CardTitle class="flex items-center gap-2 text-base">
								<Package class="h-4 w-4" />
								{good.name}
							</CardTitle>
							<CardDescription class="mt-2">{good.description}</CardDescription>
						</div>
						<Badge variant={good.ownerId ? 'default' : 'secondary'}>{'Owner'}</Badge>
					</div>
				</CardHeader>

				<CardContent>
					<Button size="sm" variant="outline" onclick={() => (transferGoodId = good.id)}>
						<ArrowRightLeft class="mr-2 h-4 w-4" />
						Transfer Ownership
					</Button>
				</CardContent>

				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for={`transfer-to-${good.id}`}>Transfer to</Label>
						<select
							id={`transfer-to-${good.id}`}
							value={transferToUserId}
							onchange={(e) => (transferToUserId = e.currentTarget.value)}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							<option value="">Select a member...</option>
						</select>
					</div>

					<div class="flex gap-2">
						<Button size="sm" onclick={handleTransferGood} disabled={!transferToUserId}>
							Confirm Transfer
						</Button>
						<Button
							size="sm"
							variant="outline"
							onclick={() => {
								transferGoodId = null;
								transferToUserId = '';
							}}
						>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
