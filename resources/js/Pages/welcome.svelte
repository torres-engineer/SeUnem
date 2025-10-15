<script>
	import Layout from '@/layouts/Layout.svelte';

	let { user } = $props();
</script>

<svelte:head>
	<title>Welcome</title>
</svelte:head>

<Layout>
	<h1>Welcome</h1>
	<p>Hello {user.name}, welcome to your first Inertia app!</p>
</Layout>
