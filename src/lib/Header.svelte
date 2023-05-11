<script>
    let navItems = [
        { name: 'Outfits', url: '/outfits' },
        { name: 'Part Picker', url: '/parts' },
        { name: 'Capes', url: '/capes' },
        { name: 'Importer', url: '/importer' },
        { name: 'Settings', url: '/settings' },
    ];
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { client, auth, msURL } from '$lib/stores.js';
</script>

<div class="w-full px-5 pt-5 mb-2">
    <button class="flex flex-col items-center justify-center w-full p-2 mr-5 rounded-lg shadow-lg {$page.url.pathname == '/' ? 'bg-green-700 text-white' : 'hover:bg-green-700/20 bg-white'}" on:click={() => goto('/')}>
        <h1 class="flex flex-row items-center justify-center text-3xl font-bold"><img src="/favicon.png" class="h-9 mr-4 aspect-square {$client.config.mcfont == true ? 'mb-1' : ''}" alt="MC Wardrobe Logo" /> MC Wardrobe<span class="ml-4 text-xl font-normal">v1.0.0</span></h1>
        <a class="text-lg" href="https://izmichael.com">&copy; IzMichael 2023 - Not affiliated with Mojang</a>
    </button>
</div>

<div class="flex flex-row items-center justify-center flex-wrap w-full gap-2 px-5">
    {#each navItems as nav}
        {#if nav.url != '/capes' || $auth.mcAccess}
        <button class="px-4 py-2 rounded-full text-center min-w-fit flex-1 shadow-lg {$page.url.pathname == nav.url ? 'bg-green-700 text-white' : 'hover:bg-green-700/20 bg-white'}" on:click={() => goto(nav.url)}>
            {nav.name}
        </button>
        {/if}
    {/each}
    {#if !$auth.mcAccess}
        <button class="hover:bg-green-700/20 flex flex-row items-center min-w-fit justify-center flex-1 px-4 py-2 text-center bg-white rounded-full shadow-lg" on:click={() => window.location = msURL}>
            <img src="/assets/icons/microsoft.svg" alt="Microsoft Logo" class="w-6 aspect-square mr-2 rounded-sm" /> Login with Microsoft
        </button>
    {:else}
        <button class="flex flex-row items-center justify-center px-4 py-2 min-w-fit rounded-full text-center flex-1 shadow-lg {$page.url.pathname == '/profile' ? 'bg-green-700 text-white' : 'hover:bg-green-700/20 bg-white'}" on:click={() => goto('/logout')}>
            <img src="/assets/icons/microsoft.svg" alt="Microsoft Logo" class="w-6 aspect-square mr-2 rounded-sm" /> Welcome Back, {$auth.username}
        </button>
    {/if}
</div>