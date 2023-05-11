import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    let input = await request.json();
    let token = request.headers.get('MCToken');

    let formdata = new FormData();
    formdata.append('image', input.canvasB64.replace('data:image/png;base64,', ''));
    formdata.append('name', 'SkinUploadTemp' + new Date());
    formdata.append('expiration', '60');

    let imgbb = await fetch('https://api.imgbb.com/1/upload?key=6ec2236282c0eaad8bf71457f3fb092c', {
        method: 'POST',
        body: formdata
    }).then(res => { return res.json(); });
    
    let uploader = await fetch('https://api.minecraftservices.com/minecraft/profile/skins', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'variant': input.variant || 'classic',
            'url': imgbb.data.url
        })
    }).then(res => { return res.json(); });

    // let canvasBinary = dataURItoBlob(input.canvasB64);

    // let bodyContent = new FormData();
    // bodyContent.append('variant', 'slim');
    // bodyContent.append('file', canvasBinary);

    // console.log(bodyContent);

    // let uploader = await fetch('https://api.minecraftservices.com/minecraft/profile/skins', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': 'Bearer ' + token,
    //         'Content-Type': 'multipart/form-data',
    //         'Origin': 'https://www.minecraft.net',
    //         'Accept': '*/*'
    //     },
    //     body: bodyContent
    // }).then(res => { return res.json(); });
    return json(uploader);
    // return json({});
};