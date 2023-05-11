<svelte:head>
    <title>MC Wardrobe | Importer</title>
</svelte:head>

<script>
    import {
        deconstruct,
        getImg,
        modernise,
        fixOpaqueSkin
    } from '$lib/libs.js';
    import { client, skinmap } from '$lib/stores';
    import { goto } from '$app/navigation';
    import Toast from '$lib/toasts.js';

    let skinStealer = false;
    let stealerName = '', stealerUUID = '';

    async function processImg(img, name) {
        if (img.width != img.height) {
            if (img.width == 2 * img.height) {
                img = await modernise(img);
            } else {
                Toast.danger(`Invalid Skin File: ${name}.`);
                return false;
            };
        };

        img = await fixOpaqueSkin(img, false);

        await deconstruct(img, name);
        return true;
    };
</script>

<div class="relative flex flex-col items-center justify-start flex-1 h-full max-h-full overflow-auto bg-white">
    <h1 class="sticky top-0 z-50 w-full p-3 text-3xl text-center text-white bg-green-700">Skin Importing</h1>
    <div class="flex flex-row items-center justify-center w-full h-full gap-10 p-10">
        <label class="rounded-xl hover:scale-105 flex flex-col items-center justify-center flex-1 h-full p-10 text-white transition-all duration-300 ease-in-out bg-blue-500 cursor-pointer">
            <input type="file" accept="image/*" multiple class="hidden" on:change={async (ev) => {
                let files = ev.target.files;
                let successful = 0;
                for (const file of files) {
                    let b64 = URL.createObjectURL(file);
                    let img = await getImg(b64);
                    let processor = await processImg(img, file.name);
                    if (processor == true) successful ++;
                };
                Toast.success(`Imported ${successful} Skins Successfully`);
                goto('/outfits');
            }}>
            <h1 class="text-2xl text-center p-3 rounded-lg bg-black/10 w-full">I have a skin file</h1>
        </label>
    
        <button class="group rounded-xl hover:scale-105 flex flex-col items-center justify-center flex-1 h-full p-10 text-white transition-all duration-300 ease-in-out bg-pink-500 cursor-pointer" on:click={() => skinStealer = true}>   
            <h1 class="text-2xl text-center p-3 rounded-lg bg-black/10 w-full">I want to use someone else's skin</h1>
            <!-- <input id="skinStealer" placeholder="Steve" class="bg-white/20 placeholder:text-white group-hover:mt-5 group-hover:h-11 group-hover:py-2 w-full h-0 px-2 py-0 overflow-hidden transition-all duration-300 ease-in-out rounded-lg" /> -->
        </button>
        
        <label class="rounded-xl hover:scale-105 flex flex-col items-center justify-center flex-1 h-full p-10 text-white transition-all duration-300 ease-in-out bg-yellow-400 cursor-pointer">
            <input type="file" accept="application/json" multiple class="hidden" on:change={async (ev) => {
                let files = ev.target.files;
                let successful = 0;
                for (const file of files) {
                    const text = await file.text();
                    const json = JSON.parse(text);
                    
                    $client.outfits.push(...json.client.outfits);
                    skinmap.layers.forEach((layer) => {
                        skinmap.parts.forEach((part) => {
                            $client.parts[layer][part].push(...json.client.parts[layer][part]);
                            $client.parts[layer][part] = $client.parts[layer][part].filter((v, i, a) => a.findIndex(v2 => (v2.id == v.id)) == i);
                        });
                    });

                    $client.outfits = $client.outfits.filter((v, i, a) => a.findIndex(v2 => (v2.id == v.id)) == i);
                };
                Toast.success(`Imported ${successful} JSON Files Successfully`);
                goto('/outfits');
            }}>
            <h1 class="text-2xl text-center p-3 rounded-lg bg-black/10 w-full">I have a JSON file export</h1>
        </label>
    </div>

    <div class="absolute flex flex-row justify-around items-center top-0 left-0 p-10 z-50 w-full h-full bg-white {skinStealer == true ? '' : 'hidden'}">
        <div class="flex flex-col items-center justify-center w-1/2 h-full">
            <h1 class="text-3xl">Skin Stealer</h1>
            <input type="text" placeholder="Steve" class="w-full p-2 mt-5 mb-3 bg-gray-100 rounded-lg" bind:value={stealerName} on:keyup={async () => {
                try {
                    let data = await fetch('https://playerdb.co/api/player/minecraft/' + stealerName).then(res => { return res.json(); });
                    stealerUUID = data?.data.player.raw_id;
                } catch (err) {
                    console.log('Invalid Username.', err);
                };
            }}>
            <button class="hover:bg-green-600 w-full p-2 text-white bg-green-700 rounded-lg" on:click={async () => {
                let img = await getImg('https://crafatar.com/skins/' + stealerUUID);
                let processor = await processImg(img, stealerName);
                if (!processor) return Toast.danger(`Invalid Skin File: ${stealerName}.`);;
                Toast.success(`Stole ${stealerName}'s Skin Successfully`);
                goto('/parts');
            }}>Steal!</button>
        </div>

        <img class="h-full" src="https://crafatar.com/renders/body/{stealerUUID || 'c06f89064c8a49119c29ea1dbd1aab82'}" alt="Skin Stealer Preview" >
    </div>

    <!-- <label class="w-1/2 p-2 px-5 mt-5 text-white cursor-pointer text-center bg-green-700 hover:bg-green-600 rounded-lg">
        Import Data from JSON
        <input type="file" class="hidden" on:change={async (event) => {
            if (event?.target?.files?.length < 1) return;

            if (!confirm('This will overwrite all existing data. Are you sure you want to continue?')) return;

            const file = event.target.files.item(0);
            const text = await file.text();
            const json = JSON.parse(text);
            
            $client = json.client;
            $auth = json.auth;
            Toast.success('Successfully Imported Data.');
        }}>
    </label> -->

    <!-- <button class="p-2 bg-blue-300" on:click={async () => {
        let url = '/assets/img/izc.png';
        let img = await getImg(url);
        deconstruct(img, 'IzC');
    }}>Deconstruct IzC</button>

    <button class="p-2 bg-blue-300" on:click={async () => {
        let url = '/assets/img/izb.png';
        let img = await getImg(url);
        deconstruct(img, 'IzB');
    }}>Deconstruct IzB</button> -->

    
</div>

<!-- <button class="hover:bg-blue-400 p-2 text-white bg-blue-500 rounded-lg" on:click={async () => { await mapSkin('/assets/img/izb.png', true); renderMap();}}>Set B</button>
<button class="hover:bg-blue-400 p-2 text-white bg-blue-500 rounded-lg" on:click={async () => { await mapSkin('/assets/img/izc.png', true); renderMap();}}>Set C</button>
<button class="hover:bg-blue-400 p-2 text-white bg-blue-500 rounded-lg" on:click={async () => { await mapSkin('/assets/img/steve.png', true); renderMap();}}>Set Steve</button>

<br>

{#each skinmap.layers as layer}
    <br>
    {#each skinmap.parts as part}
        <button class="hover:bg-blue-400 p-2 text-white bg-blue-500 rounded-lg" on:click={() => {
            // $map.clearRect(...skinmap.get(layer, part));
            $map.fillStyle = '#ff0000ff';
            $map.fillRect(...skinmap.get(layer, part));
            renderMap();
        }}>Clear {layer} {part}</button>
    {/each}
{/each} -->

<style>
    
</style>