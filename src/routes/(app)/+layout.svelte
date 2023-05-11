<script>
    import Header from '$lib/Header.svelte';
    import Sidebar from '$lib/Sidebar.svelte';
    import Loading from '$lib/Loading.svelte';

    import { client, auth } from '$lib/stores.js';
    import { SvelteToast } from '@zerodevx/svelte-toast';
    import { fade } from 'svelte/transition';
    import { navigating } from '$app/stores';
    export let data;

    let ready = false, body;
    // eslint-disable-next-line no-inner-declarations
    async function refresh() {
        if ($auth.msRefresh) {
            let data = await fetch('/msauth', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'msRefresh': $auth.msRefresh
                },
            }).then(res => { return res.json(); });

            let temp = $auth;
            temp.uuid = data.id;
            temp.username = data.name;
            temp.profile = data;
            temp.mcAccess = data.accessToken;
            temp.msRefresh = data.refresh_token;
        };
        ready = true;
    };
    refresh();
</script>

{#if ready == true}
<div class="shrink-0 font-work flex flex-col w-screen h-screen max-w-full max-h-full overflow-hidden bg-gray-100 {$client.config.mcfont != true ? 'font-clean' : 'font-minecraft'}">
    <Header />

    <div class="flex flex-row items-center justify-end w-full h-full max-w-full max-h-full px-5 pt-2 pb-5 overflow-hidden" bind:this={body}>
        {#key data.currentPath}
        <div class="flex-1 h-full max-h-full max-w-full flex flex-row items-center justify-center overflow-hidden rounded-xl shadow-lg {$navigating ? 'z-[-100]' : 'z-0'}" in:fade|local={{ duration: 0 }}>
            <slot />
        </div>
        {/key}
        
        <Sidebar />
    </div>
</div>
{:else}
    <Loading />
{/if}

<SvelteToast options={{
    pausable: true,
    theme: {
        '--toastWidth': '24rem',
        '--toastPadding': '0',
        '--toastMsgPadding': '0',
        '--toastBackground': 'transparent',
        '--toastBarHeight': '0px',
        '--toastBarWidth': '0px',
        '--toastBorderRadius': '0.75rem',
        '--toastMinHeight': '0px'
    },
    duration: 5000
}} />

<style>
    
</style>