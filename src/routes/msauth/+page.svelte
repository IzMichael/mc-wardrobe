<script>
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    import { auth } from '$lib/stores.js';
    import { onMount } from 'svelte';

    onMount(async () => {
        let data1 = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'client_id=0660aaf9-9acc-47e3-a52c-0e6c29d2a1e7&scope=XboxLive.signin&code=' + params.code + '&redirect_uri=http://localhost:5000/msauth&grant_type=authorization_code&code_verifier=YTFjNjI1OWYzMzA3MTI4ZDY2Njg5M2RkNmVjNDE5YmEyZGRhOGYyM2IzNjdmZWFhMTQ1ODg3NDcxY2Nl'
        }).then(res => { return res.json(); });

        $auth.msRefresh = data1.refresh_token;
    
        let data2 = await fetch('/msauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Token': data1.access_token
            },
        }).then(res => { return res.json(); });
    
        $auth.uuid = data2.id;
        $auth.username = data2.name;
        $auth.profile = data2;
        $auth.mcAccess = data2.accessToken;

        window.location = '/outfits';
    });
    
    import Loading from '$lib/Loading.svelte';
</script>

<Loading />

<style>
    
</style>