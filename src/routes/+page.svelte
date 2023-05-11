<svelte:head>
    <title>MC Wardrobe</title>
</svelte:head>

<script>
    
</script>

<div class="font-minecraft flex-col justify-start items-center flex">
    <section id="hero" class="flex flex-col justify-center items-center bg-gray-100 herobg shadow-inner">
        <div class="w-full h-full flex flex-col justify-center items-center backdrop-blur">
            <h1 class="text-6xl flex flex-row justify-center items-center bg-white/25 rounded-lg p-5 lg:w-fit w-full"><img src="/favicon.png" class="h-20 mr-5 mb-1 aspect-square" alt="MC Wardrobe Logo" /> MC Wardrobe</h1>
            <h2 class="text-4xl text-center bg-white/25 lg:rounded-b-lg rounded-none px-5 pb-5 lg:w-fit w-full">Craft your Style</h2>
            <a class="p-2 rounded-lg bg-green-700 hover:bg-green-600 text-white lg:block w-1/3 hidden cursor-pointer text-center" href="/outfits">Open App</a>
            <h4 class="lg:hidden bg-white/25 rounded-b-lg p-5 lg:w-fit w-full text-center">Incompatible with Mobile Devices (for now...)</h4>
        </div>
    </section>

    <!-- <section class="flex flex-row justify-center items-center p-10">
        <video src="/assets/Sidebar.mp4" class="h-full crispImage border-y border-black rounded-xl" autoplay loop />
    </section> -->
</div>

<style>
    section {
        @apply w-full h-screen;
    }

    .herobg {
        background-image: url('/assets/img/PartPicker.png');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }
</style>