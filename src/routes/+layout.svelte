<script>
    
</script>

<slot />

<style>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    :global(*) {
        overscroll-behavior: none;
        outline: none;
    }

    :global(.font-minecraft) {
        font-family: Minecraft;
    }

    :global(button) {
        @apply transition-all duration-300 ease-in-out;
    }

    @font-face {
        font-family: Minecraft;
        src: url('/assets/Minecraft.otf') format('opentype');
    }

    @font-face {
        font-family: Minecraft;
        font-weight: bold;
        src: url('/assets/Minecraft-Bold.otf') format('opentype');
    }

    :global(.crispImage) {
        image-rendering: optimizeSpeed;             /* Older versions of FF          */
        image-rendering: -moz-crisp-edges;          /* FF 6.0+                       */
        image-rendering: -webkit-optimize-contrast; /* Safari                        */
        image-rendering: -o-crisp-edges;            /* OS X & Windows Opera (12.02+) */
        image-rendering: pixelated;                 /* Awesome future-browsers       */
        -ms-interpolation-mode: nearest-neighbor;   /* IE                            */
    }
</style>