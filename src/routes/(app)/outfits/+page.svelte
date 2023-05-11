<svelte:head>
    <title>MC Wardrobe | Outfits</title>
</svelte:head>

<script>
    import { client, map, renderMap } from '$lib/stores.js';
    import { getImg } from '$lib/libs.js';
    import SimpleRender from '$lib/SimpleRender.svelte';
    import Toast from '$lib/toasts.js';
    let editor = false, editing = {};
</script>

<div class="relative flex flex-col items-center justify-start flex-1 h-full max-h-full overflow-auto bg-white">
    <div class="relative top-0 z-50 w-full p-3 text-3xl text-center text-white bg-green-700">
        <h1 class="w-full">My Outfits</h1>

        <button class="absolute top-0 left-0 flex flex-row items-center justify-center p-3" on:click={() => {
            if ($client.config.outfitLayout == 'row') {
                $client.config.outfitLayout = 'grid';
            } else {
                $client.config.outfitLayout = 'row';
            };
        }}>
            <div class="p-2 {$client.config.outfitLayout == 'row' ? 'bg-green-900' : 'bg-green-600'} transition-all duration-300 ease-in-out rounded-l-lg p-2 h-[2.25rem] aspect-square">
                <img src="/assets/icons/menu.svg" class="invert h-full rotate-90" alt="Row Icon" />
            </div>
            <div class="p-2 {$client.config.outfitLayout == 'grid' ? 'bg-green-900' : 'bg-green-600'} transition-all duration-300 ease-in-out rounded-r-lg p-2 h-[2.25rem] aspect-square">
                <img src="/assets/icons/grid.svg" class="invert h-full" alt="Row Icon" />
            </div>
        </button>
    </div>
    <div class="flex flex-row items-center justify-start {$client.config.outfitLayout == 'row' ? 'overflow-x-scroll overflow-y-hidden' : 'flex-wrap overflow-y-scroll overflow-x-hidden'} w-full h-full max-h-full p-5 gap-5">
        {#each $client.outfits as outfit}
        {#key outfit}
            <button class="hover:scale-[1.025] {$client.config.outfitLayout == 'row' ? ' shrink-0' : 'shrink-0 grow-0'} shadow flex flex-col items-center justify-start h-full max-h-full py-3 px-10 overflow-hidden transition-all duration-300 ease-in-out bg-gray-100 rounded-md" style="flex-basis: {$client.config.outfitLayout == 'row' ? 'auto' : 'calc(25% - 0.9375rem)'};" on:click={async () => {
                $map.clearRect(0, 0, 64, 64);
                let img = await getImg(outfit.img);
                $map.drawImage(img, 0, 0);
                renderMap();
            }} on:contextmenu|preventDefault={() => {
                editing = outfit;
                editor = true;
            }}>
                <h2 class="shrink-0 whitespace-nowrap w-full mb-5 text-lg text-center">{outfit.name}</h2>
                <div class="flex flex-row items-center justify-center flex-1 drop-shadow-2xl">
                    <SimpleRender skin={outfit.img} />
                </div>
                <!-- <button class="hover:bg-green-600 w-full p-2 mt-3 mb-5 text-white bg-green-700 rounded-lg" on:click={() => {
                    editing = outfit;
                    editor = true;
                }}>Manage Outfit</button> -->
            </button>
        {/key}
        {/each}
    </div>

    {#if editor == true && editing?.img}
        <div class="top-0 left-0 flex flex-row items-center justify-center max-h-full w-full border-r-4 absolute shadow-xl h-full z-[100] p-5 bg-white">
            <div id="editor" class="flex flex-col items-center justify-center flex-1 p-5 mr-5">
                <h1 class="mb-2 text-3xl">Outfit Editor</h1>
                
                <p>Outfit Name</p>
                <input type="text" bind:value={editing.name}>

                <button class="hover:bg-green-600 w-full p-2 mt-3 text-white bg-green-700 rounded-lg" on:click={() => {
                    let i = $client.outfits.findIndex(obj => obj.id == editing.id);
                    $client.outfits[i] = editing;
                    // eslint-disable-next-line no-self-assign
                    $client.outfits = $client.outfits; 
                    editor = false;
                    editing = {};
                    Toast.success('Outfit Saved');
                }}>Save Outfit</button>

                <button class="hover:bg-red-600 w-full p-2 mt-3 text-white bg-red-700 rounded-lg" on:click={() => {
                    if (confirm('Are you sure you want to delete your outfit titled "' + editing.name + '"?')) {
                        $client.outfits = $client.outfits.filter(obj => obj.id != editing.id);
                        // eslint-disable-next-line no-self-assign
                        $client.outfits = $client.outfits; 
                        editor = false;
                        editing = {};
                        Toast.warning('Outfit Deleted');
                    };
                }}>Delete Outfit</button>
            </div>
            <div class="flex flex-col h-full aspect-[20/44.8]">
                <SimpleRender skin={editing.img} />
            </div>
        </div>
    {/if}
</div>

<style>
    #editor p {
        @apply w-full text-left mb-1;
    }
    #editor input {
        @apply w-full bg-gray-100 p-2 rounded-lg;
    }
</style>