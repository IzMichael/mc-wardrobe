<script>
    import { onMount } from 'svelte';
    export let color, message, toastId;
    let progress = 0;
    // eslint-disable-next-line no-inner-declarations
    function colorShade(col, amt) {
        col = col.replace(/^#/, '');
        if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
        let [r, g, b] = col.match(/.{2}/g);
        ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt]);
        r = Math.max(Math.min(255, r), 0).toString(16);
        g = Math.max(Math.min(255, g), 0).toString(16);
        b = Math.max(Math.min(255, b), 0).toString(16);
        const rr = (r.length < 2 ? '0' : '') + r;
        const gg = (g.length < 2 ? '0' : '') + g;
        const bb = (b.length < 2 ? '0' : '') + b;
        return `#${rr}${gg}${bb}`;
    };
    onMount(() => {
        progress = 10;
        let timer = setInterval(() => {
            if (progress < 100) {
                progress += 10;
            } else {
                clearInterval(timer);
            };
        }, 500);
    });
</script>

<div id={toastId} class="rounded-xl w-96 flex flex-col items-start justify-center h-auto p-2 text-black bg-white border-l-8 shadow-2xl" style="border-left-color: {color}; background-color: {colorShade(color, 100)}">
    {#if message?.title}
    <h1 class="text-lg font-semibold">{message.title}</h1>
    <p>{message.body}</p>
    {:else}
    <h1 class="text-lg font-semibold">{message}</h1>
    {/if}

    <div class="max-h-2 bg-opacity-10 flex flex-row items-center justify-start w-full mt-1 overflow-hidden bg-black rounded-full">
        <span class="py-[4px] transition-[width] duration-1000 ease-linear" style="background-color: {color}; width: {progress}%;"></span>
    </div>
</div>

<style>
    
</style>