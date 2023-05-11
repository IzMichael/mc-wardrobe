<svelte:head>
    <title>MC Wardrobe | Part Picker</title>
</svelte:head>

<svelte:body on:click={(e) => {
    if (!createDialogShow || !createDialog) return;

    if (!createDialog?.contains(e.target) && !createBtn?.contains(e.target)) {
        createDialogShow = false;
    };
}} />

<script>
    import { client, map, renderMap, skinmap, templates } from '$lib/stores.js';
    import { getImg, uuidv4, copyImage } from '$lib/libs.js';
    import PixelEditor from '$lib/PixelEditor.svelte';
    import PartItem from '$lib/PartItem.svelte';
    import Toast from '$lib/toasts.js';
    import { fade } from 'svelte/transition';

    let panel = 'main';
    let editor = false, editing = {}, createDialogShow = false, createBtn, createDialog, createpart = 'Head', createlayer = 'Main';

    let limbs = ['r-arm', 'l-arm', 'r-leg', 'l-leg'];
</script>

{#key createBtn}
<div class="px-2 rounded-b-lg z-[100] shadow-xl border-b-2 text-white border-x-2 border-gray-400 absolute bg-green-700 w-[16rem] transition-all duration-300 ease-in-out overflow-hidden {createDialogShow ? 'h-[8.25rem] pb-2' : 'h-0 -mt-[2px] border-b-0'}" style="top: calc({createBtn?.getBoundingClientRect()?.bottom}px + 0.5rem); left: {createBtn?.getBoundingClientRect()?.right - (createDialog?.clientWidth ?? 0)}px;" bind:this={createDialog}>
    {#if createDialogShow}
        <select class="w-full p-2 rounded-lg bg-green-800 mb-2" transition:fade bind:value={createpart}>
            {#each skinmap.partLabels as part}
                <option value={part}>{part}</option>
            {/each}
        </select>
        <select class="w-full p-2 rounded-lg bg-green-800 mb-2" transition:fade bind:value={createlayer}>
            {#each skinmap.layerLabels as layer}
                <option value={layer}>{layer} Layer</option>
            {/each}
        </select>
        <button class="p-2 rounded-lg bg-green-800 hover:bg-green-600 w-full" transition:fade on:click={async () => {
            let clayervalue = skinmap.layers[skinmap.layerLabels.indexOf(createlayer)], cpartvalue = skinmap.parts[skinmap.partLabels.indexOf(createpart)];
            editing = {
                id: uuidv4(),
                img: templates[clayervalue][cpartvalue],
                title: 'Untitled ' + createlayer + ' Layer ' + createpart,
                layer: clayervalue,
                part: cpartvalue
            };
            editor = true;
            createDialogShow = false;
        }}>Create New {createpart}</button>
    {/if}
</div>
{/key}

<div class="relative flex flex-row items-center justify-start flex-1 h-full max-h-full overflow-auto bg-white">
    <div class="flex flex-col items-center justify-start w-32 h-full bg-gray-200 shadow-lg">
        <div class="flex flex-row items-center justify-center w-full">
            <button class="py-2 flex-1 {panel == 'main' ? 'bg-transparent' : 'bg-white'}" on:click={() => panel = 'main'}>Main</button>
            <button class="py-2 flex-1 {panel == 'outer' ? 'bg-transparent' : 'bg-white'}" on:click={() => panel = 'outer'}>Outer</button>
        </div>

        <!-- eslint-disable-next-line no-unused-vars -->
        {#each skinmap.parts as part, pi}
            {#each skinmap.layers as layer}
                <button class="p-2 flex-1 w-full hover:bg-gray-100 text-xl {panel == layer ? '' : 'hidden'}">{skinmap.partLabels[pi]}</button>
            {/each}
        {/each}
    </div>
    
    {#key $client.parts}
    <div class="flex flex-col items-center justify-start flex-1 h-full max-h-full overflow-auto">
        <div class="sticky top-0 z-50 w-full p-3 text-center text-white bg-green-700">
            <h1 class="text-3xl">Part Picker</h1>
            <button class="p-2 rounded-lg bg-green-800 hover:bg-green-600 absolute m-2 overflow-hidden top-0 right-0 bottom-0" bind:this={createBtn} on:click={() => createDialogShow = !createDialogShow}>+ Create New Part</button>
        </div>

        {#each skinmap.parts as part, pi}
            {#each skinmap.layers as layer, li}
                <div class="{panel == layer ? '' : 'hidden'} w-full mb-6">
                    <h1 class="border-b-green-700 w-full p-4 text-3xl border-b-2" id="#{part}Title">{skinmap.layerLabels[li]} {skinmap.partLabels[pi]}</h1>
                
                    <div class="flex flex-row flex-wrap w-full p-4 gap-2">
                        <button class="hover:bg-gray-200 aspect-square flex items-center justify-center w-16 border-2 border-red-500 rounded-md shadow-md" on:click={() => {
                            $map.clearRect(...skinmap.get(layer, part));
                            renderMap();
                        }}>
                            <img src="/assets/icons/cancel.svg" class="aspect-square w-full opacity-75" alt="No Asset" >
                        </button>

                        {#each $client.parts[layer][part] as item}
                            {#key item.img}
                                <PartItem {layer} {part} {item} bind:editor bind:editing />
                            {/key}
                        {/each}
                    </div>
                </div>
            {/each}
        {/each}
    </div>
    {/key}

    {#if editor == true && editing?.part}
    <div id="editor" class="flex flex-col items-center justify-start max-h-full overflow-auto transition-all duration-300 ease-in-out w-1/3 border-l-4 shadow-xl h-full z-[100] p-5 bg-white">
        <h1 class="mb-5 text-3xl">Part Editor</h1>
        <!-- <img src={editing.cropped} class="aspect-square crispImage w-full p-2 bg-gray-100 rounded-lg" alt={editing.title} title={editing.title} > -->
        
        <div class="max-w-full w-full h-fit shrink-0 overflow-hidden rounded-lg">
            {#key editing}
            <PixelEditor bodypart={editing} layer={editing.layer} part={editing.part} />
            {/key}
        </div>
                
        <p class="mt-5">Part Name</p>
        <input type="text" bind:value={editing.title}>

        <p class="mt-5">Copy Part To</p>
        {#if limbs.includes(editing.part)}
            <!-- {#each skinmap.layers as layer, li}
            <div class="w-full flex flex-row justify-center items-center gap-1 mt-1">
                {#each limbs.filter(a => layer + '-' + a != editing.layer + '-' + editing.part) as limb}
                    <button class="hover:bg-green-600 w-full p-2 text-white bg-blue-600 rounded-lg" on:click={async () => {
                        let tempCanvas = document.createElement('canvas');
                        let tempCtx = tempCanvas.getContext('2d');

                        tempCtx.drawImage(await getImg(editing.img), 0, 0);
                        copyImage(tempCtx, ...skinmap.get(editing.layer, editing.part), ...skinmap.get(editing.layer, limb).splice(0, 2));

                        let newpart = {...editing};
                        newpart.img = tempCanvas.toDataURL('image/png');

                        newpart.id = uuidv4();
                        $client.parts[newpart.layer][limb] = [...$client.parts[newpart.layer][limb], newpart];
                        Toast.success('Part Copied');
                    }}>{skinmap.layerLabels[li]}<br>{skinmap.partLabels[limbs.indexOf(limb) + 2]}</button>
                {/each}
            </div>
            {/each} -->

            {#each limbs as limb}
                <div class="w-full flex flex-row justify-center items-center gap-1 mt-1">
                    {#each skinmap.layers as layer, li}
                        <button class="w-full p-2 rounded-lg {layer + '-' + limb == editing.layer + '-' + editing.part ? 'bg-gray-300 text-black' : 'bg-blue-600 text-white hover:bg-blue-500'}" on:click={async () => {
                            if (layer + '-' + limb == editing.layer + '-' + editing.part) return;

                            let tempCanvas = document.createElement('canvas');
                            let tempCtx = tempCanvas.getContext('2d');
                            tempCanvas.width = 64;
                            tempCanvas.height = 64;

                            tempCtx.drawImage(await getImg(editing.img), 0, 0);
                            copyImage(tempCtx, ...skinmap.get(editing.layer, editing.part), ...skinmap.get(layer, limb).splice(0, 2));
                            tempCtx.clearRect(...skinmap.get(editing.layer, editing.part));

                            let newpart = {...editing};
                            newpart.img = tempCanvas.toDataURL('image/png');
                            delete newpart.cropped;
                            delete newpart.part;
                            delete newpart.layer;

                            console.log(editing.img, newpart.img);

                            newpart.id = uuidv4();
                            $client.parts[layer][limb] = JSON.parse(JSON.stringify([...$client.parts[layer][limb], newpart]));
                            // $client = JSON.parse(JSON.stringify($client));
                            Toast.success('Part Copied');
                        }}>{skinmap.layerLabels[li]} {skinmap.partLabels[limbs.indexOf(limb) + 2]}</button>
                    {/each}
                </div>
            {/each}
        {:else}
            <div class="w-full flex flex-row justify-center items-center gap-1 mt-1">
                {#each skinmap.layers as layer, li}
                    <button class="w-full p-2 rounded-lg {layer + '-' + editing.part == editing.layer + '-' + editing.part ? 'bg-gray-300 text-black cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer'}" on:click={async () => {
                        if (layer + '-' + editing.part == editing.layer + '-' + editing.part) return;

                        let tempCanvas = document.createElement('canvas');
                        let tempCtx = tempCanvas.getContext('2d');
                        tempCanvas.width = 64;
                        tempCanvas.height = 64;

                        tempCtx.drawImage(await getImg(editing.img), 0, 0);
                        // copyImage(tempCtx, ...skinmap.get(editing.layer, editing.part), ...skinmap.get(layer, editing.part).splice(0, 2));
                        tempCtx.drawImage(tempCanvas, ...skinmap.get(editing.layer, editing.part), ...skinmap.get(layer, editing.part).splice(0, 2));
                        tempCtx.clearRect(...skinmap.get(editing.layer, editing.part));

                        let newpart = {...editing};
                        newpart.img = tempCanvas.toDataURL('image/png');
                        delete newpart.cropped;
                        delete newpart.part;
                        delete newpart.layer;

                        console.log(editing, newpart);

                        newpart.id = uuidv4();
                        $client.parts[layer][editing.part] = JSON.parse(JSON.stringify([...$client.parts[layer][editing.part], newpart]));
                        // $client = JSON.parse(JSON.stringify($client));
                        Toast.success('Part Copied');
                    }}>{skinmap.layerLabels[li]} {skinmap.partLabels[skinmap.parts.indexOf(editing.part)]}</button>
                {/each}
            </div>
        {/if}

        <button class="hover:bg-red-600 w-full p-2 mt-10 text-white bg-red-700 rounded-lg" on:click={() => {
            editor = false;
            editing = {};
            console.log($client);
        }}>Close without Saving</button>

        {#if $client.parts[editing.layer][editing.part].map(p => p.id).includes(editing.id)}
        <button class="hover:bg-green-600 w-full p-2 mt-3 text-white bg-green-700 rounded-lg" on:click={() => {
            let i = $client.parts[editing.layer][editing.part].findIndex(obj => obj.id == editing.id);
            $client.parts[editing.layer][editing.part][i] = editing;
            // eslint-disable-next-line no-self-assign
            $client.parts[editing.layer][editing.part] = $client.parts[editing.layer][editing.part];
            editor = false;
            editing = {};
            Toast.success('Part Saved');
        }}>Save Existing Part</button>
        {/if}

        <button class="hover:bg-green-600 w-full p-2 mt-3 text-white bg-green-700 rounded-lg" on:click={() => {
            editing.id = uuidv4();
            $client.parts[editing.layer][editing.part] = [...$client.parts[editing.layer][editing.part], editing];
            editor = false;
            editing = {};
            Toast.success('Part Created');
        }}>Save as New Part</button>

        <button class="hover:bg-red-600 w-full p-2 mt-10 text-white bg-red-700 rounded-lg" on:click={() => {
            if (confirm(`Are you sure you want to delete your ${skinmap.layerLabels[skinmap.layers.indexOf(editing.layer)]} ${skinmap.partLabels[skinmap.parts.indexOf(editing.part)]} part titled "${editing.title}"?`)) {
                // $client.parts[editing.layer][editing.part] = $client.parts[editing.layer][editing.part].filter(obj => obj.img != editing.img);
                let i = $client.parts[editing.layer][editing.part].findIndex(obj => obj.id == editing.id);
                $client.parts[editing.layer][editing.part].splice(i, 1);
                // eslint-disable-next-line no-self-assign
                $client.parts[editing.layer][editing.part] = $client.parts[editing.layer][editing.part]; 
                editor = false;
                editing = {};
                Toast.warning('Part Deleted');
            };
        }}>Delete Part</button>
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