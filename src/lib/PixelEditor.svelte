<script>
    import { onDestroy, onMount } from 'svelte';
    export let bodypart = {}, layer = '', part = '';
    import { mappings, skinmap, color, render, renderMap, exclusiveRender, allRender, templates } from '$lib/stores.js';
    import { getImg, colorTone, floodFill } from '$lib/libs.js';
    import { colord, extend } from 'colord';
    import a11yPlugin from 'colord/plugins/a11y';
    extend([a11yPlugin]);

    import '@simonwep/pickr/dist/themes/classic.min.css';
    import Pickr from '@simonwep/pickr';

    let pickerBtn, pickr, colorpicker = '';

    let img = mappings[layer][part][0],
        offsetX = img[0],
        offsetY = img[1],
        width = img[2],
        height = img[3],
        whitespace = skinmap.whitespace(layer, part);

    onMount(async () => {
        ctx = canvas.getContext('2d');
        ctx.drawImage(await getImg(bodypart.img), -offsetX, -offsetY);

        pickr = undefined;
        pickr = Pickr.create({
            el: pickerBtn,
            theme: 'classic',
            useAsButton: true,

            default: $color,
            swatches: [
                // Open Colors, Shade 5
                'rgba(173, 181, 189, 1)',
                'rgba(255, 107, 107, 1)',
                'rgba(240, 101, 149, 1)',
                'rgba(204,  93, 232, 1)',
                'rgba(132,  94, 247, 1)',
                'rgba( 92, 124, 250, 1)',
                'rgba( 51, 154, 240, 1)',
                'rgba( 34, 184, 207, 1)',
                'rgba( 32, 201, 151, 1)',
                'rgba( 81, 207, 102, 1)',
                'rgba(148, 216,  45, 1)',
                'rgba(252, 196,  25, 1)',
                'rgba(255, 146,  43, 1)',

                // Monk Skin Tone Scale, From Google
                '#f6ede4',
                '#f3e7db',
                '#f7ead0',
                '#eadaba',
                '#d7bd96',
                '#a07e56',
                '#825c43',
                '#604134',
                '#3a312a',
                '#292420',

                // Black and White
                'rgba(255, 255, 255, 1)',
                'rgba(0, 0, 0, 1)'
            ],

            components: {
            // Main components
                preview: true,
                opacity: true,
                hue: true,

                // Input / output Options
                interaction: {
                    hex: true,
                    rgba: true,
                    hsla: true,
                    hsva: true,
                    cmyk: false,
                    input: true,
                    clear: false,
                    save: false
                }
            }
        });

        pickr.on('change', (color) => {
            colorpicker = color.toHEXA().toString();
            updateColorStore();
        });
        pickr.on('swatchselect', (color) => {
            colorpicker = color.toHEXA().toString();
            updateColorStore();
        });
    });

    onDestroy(() => {
        pickr = undefined;
    });

    function updateColorStore() {
        color.set(colorpicker);
        console.log(colorpicker, $color);
    };

    let canvas, ctx, tool = 'brush', toner = false, states = [], undone = [], grid = false;
    let pos = { x: 0, y: 0 };
    function setPosition(evt) {
        var rect = canvas.getBoundingClientRect();
        pos = {
            x: Math.floor( ( evt.clientX - rect.left ) / ( rect.right - rect.left ) * canvas.width ),
            y: Math.floor( ( evt.clientY - rect.top ) / ( rect.bottom - rect.top ) * canvas.height )
        };
    };

    function canvasDraw(e, drag = false) {
        if (states.length < 1) states.push(canvas.toDataURL('image/png'));

        let oldpos = {...pos};
        setPosition(e);
        if (pos.x == oldpos.x && pos.y == oldpos.y && drag) return;

        ctx.fillStyle = colorTone($color, toner);
        if (tool == 'brush') {
            ctx.clearRect(pos.x, pos.y, 1, 1);
            ctx.fillRect(pos.x, pos.y, 1, 1);
        } else if (tool == 'eraser') {
            ctx.clearRect(pos.x, pos.y, 1, 1);
        } else if (tool == 'fill') {
            let rgb = colord($color).toRgbString();
            floodFill(canvas, ctx, pos.x, pos.y, rgb, toner);
        } else if (tool == 'picker') {
            let pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            console.log(pixel);
            $color = colord({ r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] / 255 }).toHex();
            if (!drag) tool = 'brush';
            pickr.setColor($color);
        };

        whitespace.forEach(ws => {
            ctx.clearRect(ws[0] - offsetX, ws[1] - offsetY, ws[2], ws[3]);
        });

        let state = canvas.toDataURL('image/png');
        if (states.at(-1) != state) states = [...states, state];
        undone = [];

        update();
    };

    function save() {
        let tempCanvas = document.createElement('canvas');
        let tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 64;
        tempCanvas.height = 64;

        tempCtx.drawImage(canvas, offsetX, offsetY, width, height);
        bodypart.img = tempCanvas.toDataURL('image/png');
    };

    function update() {
        save();

        if (preview) {
            exclusiveRender(layer, part);
            $render = bodypart.img;
        } else {
            allRender();
            renderMap();
        };
    };

    let preview = false;
</script>

<div class="w-full h-full select-none bg-gray-100">
    <!-- Actions -->
    <div class="flex flex-row justify-center items-center w-full">
        <button on:click={async () => {
            if (states.length < 1) return;
            ctx.clearRect(0, 0, 64, 64);
            ctx.drawImage(await getImg(states.at(-1)), 0, 0);
            undone = [...undone, states.at(-1)];
            states.splice(-1);
            // eslint-disable-next-line no-self-assign
            states = states;
            update();
        }} title="Undo">
            <img src="/assets/icons/undo.svg" class="w-6 h-6" alt="Undo Icon" />
        </button>
        
        <button on:click={async () => {
            if (undone.length < 1) return;
            ctx.clearRect(0, 0, 64, 64);
            ctx.drawImage(await getImg(undone.at(-1)), 0, 0);
            states = [...states, undone.at(-1)];
            undone.splice(-1);
            // eslint-disable-next-line no-self-assign
            undone = undone;
            update();
        }} title="Redo">
            <img src="/assets/icons/redo.svg" class="w-6 h-6" alt="Redo Icon" />
        </button>
        
        <button on:click={async () => {
            if (states.length < 1) return;
            ctx.clearRect(0, 0, 64, 64);
            ctx.drawImage(await getImg(states.at(0)), 0, 0);
        
            let state = canvas.toDataURL('image/png');
            if (states.at(-1) != state) states = [...states, state];
            
            undone = [];
            // eslint-disable-next-line no-self-assign
            states = states;
            update();
        }} title="Reset Changes">
            <img src="/assets/icons/reset.svg" class="w-6 h-6" alt="Reset Icon" />
        </button>
        
        <button on:click={async () => {
            if (states.length < 1) states.push(canvas.toDataURL('image/png'));

            ctx.clearRect(0, 0, 64, 64);
            let coords = skinmap.get(layer, part);
            ctx.drawImage(await getImg(templates[layer][part]), -coords[0], -coords[1]);

            let state = canvas.toDataURL('image/png');
            if (states.at(-1) != state) states = [...states, state];
            undone = [];
            update();
        }} title="Reset to Template">
            <img src="/assets/icons/map.svg" class="w-6 h-6" alt="Map Icon" />
        </button>

        <button class:active={preview} on:click={() => {
            preview = !preview;
            update();
        }} title="Preview Part">
            <img src="/assets/icons/eye.svg" class="w-6 h-6" alt="Eye Icon" />
        </button>
    </div>

    <div class="w-full relative" class:showGrid={grid}>
        <canvas class="w-full crispImage bg-gray-100" {width} {height} bind:this={canvas} on:mousemove={(e) => {
            if (e.buttons != 1) return;
        
            canvasDraw(e, true);
        }} on:click={(e) => canvasDraw(e, false)} on:mouseenter={setPosition} />
        
        {#if width > 0 && height > 0}
        <div class="grid" style="--grid-cols: {width};--grid-rows: {height};">
            {#each Array(width * height) as i}
                <div id="grid-item-{i}" class="border-[0.25px] border-white/50 bg-transparent w-full h-full aspect-square"></div>
            {/each}
        </div>
        {/if}
</div>

    <!-- Tools -->
    <div class="flex flex-row justify-center items-center w-full">
        <button class:active={tool == 'brush'} on:click={() => tool = 'brush'} title="Brush">
            <img src="/assets/icons/brush.svg" class="w-6 h-6" alt="Brush Icon" />
        </button>

        <button class:active={tool == 'eraser'} on:click={() => tool = 'eraser'} title="Eraser">
            <img src="/assets/icons/eraser.svg" class="w-6 h-6" alt="Eraser Icon" />
        </button>

        <button class:active={tool == 'picker'} on:click={() => tool = 'picker'} title="Colour Picker">
            <img src="/assets/icons/eyedropper.svg" class="w-6 h-6" alt="Eyedropper Icon" />
        </button>

        <button class:active={tool == 'fill'} on:click={() => tool = 'fill'} title="Flood Fill">
            <img src="/assets/icons/paint.svg" class="w-6 h-6" alt="Paint Roller Icon" />
        </button>

        <button class:active={grid} on:click={() => grid = !grid} title="Show Grid">
            <img src="/assets/icons/table.svg" class="w-6 h-6" alt="Grid Icon" />
        </button>
    </div>

    <!-- Colours -->
    <button class="flex flex-row justify-center items-center w-full cursor-pointer transition-all duration-300 ease-in-out" style="background-color: {$color}; color: {colord('#000000').isReadable($color) ? '#000000' : '#ffffff'};" bind:this={pickerBtn}>
        <img src="/assets/icons/eyedropper-filled.svg" class="w-6 h-6 mx-2" class:invert={!colord('#000000').isReadable($color)} alt="Eyedropper Icon" />
        <p class="text-center h-6 flex justify-center items-center select-text">{$color}</p>
    </button>

    <div class="flex flex-row justify-center items-center w-full">
        <button on:click={() => $color = colord($color).darken(0.02).toHex()} title="Darker Shade">
            <img src="/assets/icons/darker.svg" class="w-6 h-6" alt="Darken Icon" />
        </button>

        <button on:click={() => $color = colord($color).lighten(0.02).toHex()} title="Lighter Shade">
            <img src="/assets/icons/brighter.svg" class="w-6 h-6" alt="Lighten Icon" />
        </button>

        <button class:active={toner} on:click={() => toner = !toner} title="Auto Shading">
            <img src="/assets/icons/texture.svg" class="w-6 h-6" alt="Textured Icon" />
        </button>
    </div>
</div>

<style>
    button {
        padding: 0.5rem;
        flex: 1 1 0%;
        display: flex;
        justify-content: center;
        align-items: center;
        @apply bg-gray-100;
    }
    button:hover {
        @apply bg-gray-200;
    }
    button.active, button:active {
        @apply bg-gray-300;
    }

    div div.grid {
        display: none;
    }

    div.showGrid div.grid {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 100;
        inset: 0;
        display: grid;
        grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
        grid-template-rows: repeat(var(--grid-rows), minmax(0, 1fr));
        pointer-events: none;
    }

    div.showGrid div.grid div {
        pointer-events: none;
    }
</style>