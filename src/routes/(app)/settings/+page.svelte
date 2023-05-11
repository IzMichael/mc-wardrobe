<svelte:head>
    <title>MC Wardrobe | Settings</title>
</svelte:head>

<script>
    import { client, defaultClient, auth } from '$lib/stores.js';
    import Toast from '$lib/toasts.js';

    let dlBtn;
    
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
        'client': $client,
        'auth': $auth
    }));
    var stringLength = dataStr.length - 'data:image/png;base64,'.length;
    var sizeInBytes = Math.ceil(stringLength / 4) * 3;
    var sizeInKb = Math.ceil(sizeInBytes / 1000);
</script>

<div class="flex flex-col items-center justify-start flex-1 h-full max-h-full overflow-auto bg-white">
    <h1 class="sticky top-0 z-50 w-full p-3 text-3xl text-center text-white bg-green-700">Settings</h1>

    <button class="flex flex-row items-center justify-center w-1/2 mt-5" on:click={() => {
        $client.config.mcfont = !$client.config.mcfont;
    }}>
        <div class="p-2 text-white font-minecraft text-center flex-1 transition-all duration-300 ease-in-out {$client.config.mcfont == true ? 'bg-green-700 text-white' : 'bg-gray-300 text-black'} rounded-l-lg">
            <p>Minecraft Font</p>
        </div>
        <div class="p-2 text-white font-clean flex-1 text-center transition-all duration-300 ease-in-out {$client.config.mcfont == false ? 'bg-green-700 text-white' : 'bg-gray-300 text-black'} rounded-r-lg">
            <p>Sans Serif Font</p>
        </div>
    </button>

    <button class="w-1/2 p-2 px-5 mt-5 text-white text-center bg-red-500 rounded-lg" on:click={() => {
        if (confirm('Are you sure you want to reset your data?') == true) {
            $client = defaultClient;
            Toast.warning('Cleared all Data');
            window.location = '/outfits';
        };
    }}>Reset Data</button>

    <button class="w-1/2 p-2 px-5 mt-5 text-white text-center bg-green-700 hover:bg-green-600 rounded-lg" on:click={() => {
        dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
            'client': $client,
            'auth': $auth
        }));
        dlBtn.setAttribute('href', dataStr);
        dlBtn.setAttribute('download', 'mcwardrobe-export.json');
        dlBtn.click();
    }}>Export Data as JSON (Approx. {sizeInKb} KB)</button>

    <!-- svelte-ignore a11y-missing-attribute a11y-missing-content -->
    <a class="hidden" bind:this={dlBtn}></a>

    <label class="w-1/2 p-2 px-5 mt-5 text-white cursor-pointer text-center bg-green-700 hover:bg-green-600 rounded-lg">
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
    </label>
</div>

<style>
    
</style>