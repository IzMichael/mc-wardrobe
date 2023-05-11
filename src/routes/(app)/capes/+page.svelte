<svelte:head>
    <title>MC Wardrobe | Capes</title>
</svelte:head>

<script>
    import { auth } from '$lib/stores.js';
    import { cropPart } from '$lib/libs.js';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Toast from '$lib/toasts.js';
    let capes = [];

    onMount(async () => {
        if (!$auth.mcAccess) {
            goto('/outfits');
        };
        // https://sessionserver.mojang.com/session/minecraft/profile/
        capes = await fetch('/capes/list', {
            method: 'GET',
            headers: {
                'MCToken': $auth.mcAccess
            }
        }).then(res => { return res.json(); });
    });
</script>

<div class="relative flex flex-col items-center justify-start flex-1 h-full max-h-full overflow-auto bg-white">
    <div class="relative top-0 z-50 w-full p-3 text-3xl text-center text-white bg-green-700">
        <h1 class="w-full">My Capes</h1>
    </div>
    <div class="flex flex-row items-center justify-start overflow-x-scroll overflow-y-hidden w-full h-full max-h-full p-5 gap-5">
        <button class="hover:scale-105 flex flex-col items-center justify-start h-full max-h-full p-3 overflow-hidden transition-all duration-300 ease-in-out {capes.filter(cape => cape.state == 'ACTIVE').length < 1 ? 'bg-green-700/30' : 'bg-gray-100'} rounded-md" on:click={async () => {
            await fetch('/capes', {
                method: 'DELETE',
                headers: {
                    'MCToken': $auth.mcAccess
                }
            }).then(res => { return res.json(); });
            capes = capes.map(cape => { cape.state = 'INACTIVE'; return cape; });
            Toast.success('Set Cape to "None"');
        }}>
            <h2 class="shrink-0 whitespace-nowrap text-lg text-center">No Cape</h2>
            <img class="h-full crispImage rounded-lg object-contain opacity-75 aspect-[1.5/3]" src='/assets/icons/cancel.svg' alt="No Cape">
        </button>
        
        {#each capes as cape}
            <button class="hover:scale-105 flex flex-col items-center justify-start h-full max-h-full p-3 overflow-hidden transition-all duration-300 ease-in-out {cape.state == 'ACTIVE' ? 'bg-green-700/30' : 'bg-gray-100'} rounded-md" on:click={async () => {
                let profile = await fetch('/capes', {
                    method: 'PUT',
                    headers: {
                        'MCToken': $auth.mcAccess,
                        'CapeId': cape.id
                    }
                }).then(res => { return res.json(); });
                if (profile.profile?.id) {
                    capes = profile.profile.capes;
                    Toast.success(`Set Cape to "${cape.alias}"`);
                };
            }}>
                <h2 class="shrink-0 whitespace-nowrap mb-3 text-lg text-center">{cape.alias}</h2>
                {#await cropPart([1, 1, 10, 15], cape.url, false) then cropped}
                    <img class="h-full aspect-[1.5/3] crispImage rounded-lg" src={cropped} alt="{cape.alias} Preview">
                {/await}
            </button>
        {/each}
    </div>
</div>

<style>
    
</style>