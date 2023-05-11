async function msAuth(msaccess) {
    // Step 4
    var req4 = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            'Properties': {
                'AuthMethod': 'RPS',
                'SiteName': 'user.auth.xboxlive.com',
                'RpsTicket': 'd=' + msaccess
            },
            'RelyingParty': 'http://auth.xboxlive.com',
            'TokenType': 'JWT'
        })
    }).then(res => {return res.json();});
    (req4);

    // Step 5
    var req5 = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            'Properties': {
                'SandboxId': 'RETAIL',
                'UserTokens': [
                    req4.Token
                ]
            },
            'RelyingParty': 'rp://api.minecraftservices.com/',
            'TokenType': 'JWT'
        })
    }).then(res => {return res.json();});
    (req5);

    // Step 6
    var req6 = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'http://localhost:5000/'
        },
        body: JSON.stringify({
            'identityToken': `XBL3.0 x=${req5.DisplayClaims.xui[0].uhs};${req5.Token}`
        })
    }).then(res => {return res.json();});
    (req6);

    // Step 7
    var req7 = await fetch('https://api.minecraftservices.com/entitlements/mcstore', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + req6.access_token
        }
    }).then(res => {return res.json();});
    (req7);

    if (req7.items.length < 0) {
        return { 'message': 'User does not own Minecraft Java' };
    };

    // Step 8

    var authdata = await fetch('https://api.minecraftservices.com/minecraft/profile', {
        headers: {
            'Authorization': 'Bearer ' + req6.access_token
        }
    }).then(res => {return res.json();});
    (authdata);

    authdata.accessToken = req6.access_token;

    return authdata;
};

import { json } from '@sveltejs/kit';

// Code (First Sign In)
export async function POST({ request }) {
    (request.headers.get('token'));
    let data = await msAuth(request.headers.get('token'));

    return json(data);
};

// Refresh Token Flow
export async function PUT({ request }) {
    let msRefresh = request.headers.get('msRefresh');

    let newData = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'http://localhost:5000/'
        },
        body: 'client_id=0660aaf9-9acc-47e3-a52c-0e6c29d2a1e7&scope=XboxLive.signin&refresh_token=' + msRefresh + '&grant_type=refresh_token'
    }).then(res => { return res.json(); });
    (newData);
    let msAccess = newData.access_token;

    let data = await msAuth(msAccess);

    return json({ ...data, 'refresh_token': newData.refresh_token });
};