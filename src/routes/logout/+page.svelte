<script>
    import { auth } from '$lib/stores.js';
    import { onMount } from 'svelte';

    onMount(async () => {
        $auth = {};
        window.location = '/';
    });
    
    import Loading from '$lib/Loading.svelte';
</script>

<Loading />

<style>
    
</style>