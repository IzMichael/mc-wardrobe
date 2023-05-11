<svelte:head>
    <title>404 | Svelte App</title>
</svelte:head>

<script>
    import { page } from '$app/stores';
</script>

<h1 class="text-6xl font-bold">{$page.error.code ? $page.error.code + ' - ' : ''}{$page.error.message}</h1>
<a href="/" data-sveltekit-reload>Return Home?</a>

<style>
    
</style>