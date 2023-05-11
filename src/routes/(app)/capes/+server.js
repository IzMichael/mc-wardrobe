import { json } from '@sveltejs/kit';

export async function PUT({ request }) {
    let token = request.headers.get('MCToken');

    let profile = await fetch('https://api.minecraftservices.com/minecraft/profile/capes/active', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'capeId': request.headers.get('capeId')
        })
    }).then(res => { return res.json(); });

    return json({ code: 200, profile });
};

export async function DELETE({ request }) {
    let token = request.headers.get('MCToken');

    await fetch('https://api.minecraftservices.com/minecraft/profile/capes/active', {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(res => { return res.json(); });

    return json({ code: 200 });
};