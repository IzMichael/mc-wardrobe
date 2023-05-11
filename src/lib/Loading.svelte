<script>
    import { client } from '$lib/stores.js';
</script>

<div class="w-screen h-screen flex flex-col justify-center items-center {$client.config.mcfont != true ? 'font-clean' : 'font-minecraft'}">
    <h1 class="text-6xl flex flex-row justify-center items-center"><img src="/favicon.png" class="h-20 mr-5 {$client.config.mcfont == true ? 'mb-1' : ''} aspect-square" alt="MC Wardrobe Logo" /> MC Wardrobe</h1>
    <h1 class="text-4xl text-center">Loading...</h1>
</div>

<style>
    
</style>