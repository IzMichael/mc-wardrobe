import { json } from '@sveltejs/kit';

export async function GET({ request }) {
    let token = request.headers.get('MCToken');

    let profile = await fetch('https://api.minecraftservices.com/minecraft/profile/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(res => { return res.json(); });

    return json(profile.capes);
};