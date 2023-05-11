<script>
    import { client, auth, render, renderer, map, renderMap } from '$lib/stores.js';
    import { uuidv4, getImg } from '$lib/libs.js';
    import Toast from '$lib/toasts.js';
    let mapEl, renderEl;
    $: if (mapEl) $map = mapEl.getContext('2d');

    import { SkinViewer, IdleAnimation } from 'skinview3d';
    import { onMount } from 'svelte';

    let renderParent;

    onMount(async () => {
        $renderer = new SkinViewer({
            canvas: renderEl,
            width: renderParent.clientWidth,
            height: renderParent.clientHeight,
            skin: $render
        });

        $renderer.controls.enableRotate = true;
        $renderer.controls.enableZoom = false;
        $renderer.controls.enablePan = false;
        $renderer.controls.autoRotate = true;
        $renderer.animation = new IdleAnimation();
        $renderer.background = null;

        if ($auth.uuid) {
            let skin = await getImg($auth.profile.skins[0].url);
            $map.drawImage(skin, 0, 0);
            renderMap();
            showCape(true);
        };
    });

    function showCape(value) {
        if (value == true) {
            let usedCape = $auth.profile.capes.filter(a => a.state == 'ACTIVE');
            if (usedCape.length == 1) $renderer.loadCape(usedCape[0].url);
            capeShown = true;
        } else {
            $renderer.loadCape(null);
            capeShown = false;
        };
    };
    let capeShown = false;

    render.subscribe(value => {
        if ($renderer?.canvas) $renderer.loadSkin(value);
    });
</script>

<div class="rounded-xl flex flex-col items-center justify-start shrink-0 w-1/5 h-full p-3 ml-5 bg-white shadow-lg">
    <div class="flex flex-row items-center justify-between w-full mb-3">
        <button class="flex-1 min-w-fit p-2 text-white {$renderer.controls?.autoRotate == true ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'} rounded-lg" on:click={() => $renderer.controls.autoRotate = !$renderer.controls.autoRotate}>Auto Rotate</button>
        {#if $auth?.profile?.capes?.length > 0}
            <button class="flex-1 min-w-fit p-2 ml-3 text-white rounded-lg {capeShown == true ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}" on:click={() => $renderer.playerObject.cape.visible == true ? showCape(false) : showCape(true)}>Preview with Cape</button>
        {/if}
    </div>

    <div class="relative flex-1 w-full overflow-hidden rounded-lg crispImage" bind:this={renderParent}>
        <canvas bind:this={renderEl} class="bg-grass z-40 w-full bg-gray-200 rounded-lg"></canvas>
        <canvas bind:this={mapEl} width="64" height="64" class="w-[15%] transition-all duration-300 ease-in-out hover:w-full aspect-square absolute bottom-0 right-0 z-50 hover:p-1 p-[1px] rounded-lg rounded-br-none bg-gray-100"></canvas>
    </div>

    <!-- <canvas bind:this={mapEl} width="64" height="64" class="w-[1px] aspect-square absolute top-0 left-0"></canvas> -->

    <div class="flex flex-row items-center justify-between w-full mt-3">
        <button class="hover:bg-green-600 flex-1 p-2 text-white bg-green-700 rounded-lg" on:click={async () => {
            let name = prompt('What will you call this outfit?');
            if (name.length < 1) {
                return;
            };
            $client.outfits = [...$client.outfits, {
                'id': uuidv4(),
                'name': name,
                'img': $map.canvas.toDataURL('image/png'),
                'tags': ['Created']
            }];
            Toast.success('Outfit Saved');
        }}>Save Outfit</button>
        {#if $auth.mcAccess}
        <button class="hover:bg-green-600 flex-1 p-2 ml-3 text-white bg-green-700 rounded-lg" on:click={async () => {
            let infoToast = Toast.info('Setting Skin...');
            let canvasB64 = $map.canvas.toDataURL();

            let uploader = await fetch('/skinUploader', {
                method: 'POST',
                // body: bodyContent,
                headers: {
                    'MCToken': $auth.mcAccess,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'variant': 'slim',
                    'canvasB64': canvasB64
                })
            }).then(res => { return res.json(); });

            Toast.remove(infoToast);
            if (uploader?.id) {
                Toast.success('Skin Set Successfully');
            } else {
                Toast.danger('There was a glitch: ' + uploader.errorMessage);
            };
        }}>Use Skin</button>
        {/if}
    </div>
    <button class="hover:bg-green-600 w-full p-2 mt-3 text-white bg-green-700 rounded-lg" on:click={() => {
        let link = document.createElement('a');
        link.download = 'skin.png';
        link.href = $map.canvas.toDataURL();
        link.click();
    }}>Download Skin</button>
</div>

<style>
    .bg-grass {
        background-image: url('/assets/img/bg.png');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
    }
</style>