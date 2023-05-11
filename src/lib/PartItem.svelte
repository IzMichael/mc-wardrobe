<script>
    import { render, map, renderMap, skinmap, exclusiveRender, allRender } from '$lib/stores.js';
    import { getImg, cropPart } from '$lib/libs.js';
    import { onMount } from 'svelte';

    export let editor = false, editing = {}, layer, part, item;
    let cropped = '';

    onMount(() => getCrop());

    $: if (cropped == 'data:,') getCrop();

    // let coords = skinmap.get(layer, part);

    async function getCrop() {
        // cropped = '';
        cropped = await cropPart(skinmap.get(layer, part), item.img, false);
        // console.log(cropped);
        // item.cropped = cropped;
    };
</script>

<button class="hover:bg-gray-200 flex items-center justify-center h-16 border-2 border-green-700 bg-gray-100 rounded-md shadow-md" on:click={async () => {
    // $map.clearRect(...skinmap.get(layer, part));
    let img = await getImg(item.img);
    $map.drawImage(img, 0, 0);
    renderMap();
}}  on:mouseover={() => { exclusiveRender(layer, part); $render = item.img; }} on:mouseout={() => { allRender(); renderMap(); }}
    on:focus={() => { exclusiveRender(layer, part); $render = item.img; }}     on:blur={() => { allRender(); renderMap(); }}
    on:contextmenu|preventDefault={async () => {
        editing = {...item};
        editing.cropped = await cropPart(skinmap.get(layer, part), item.img, false);
        editing.layer = layer;
        editing.part = part;
        editor = true;
    }}>
    <!-- <img src={item.img} class="aspect-square w-full" alt={item.title} title={item.title} /> -->
    <img src={cropped} class="crispImage h-full rounded" alt={item.title} title={item.img} />
    <!-- <img src={item.img} class="h-full" width={coords[2]} height={coords[3]} alt={item.title} title={item.title} style="object-position: -{coords[0]}px -{coords[1]}px;" /> -->
</button>

<style>
    
</style>

<!-- <script>
    export let item;
</script>

<img src={item.img} class="aspect-square w-full" alt={item.title} title={item.title} /> -->

