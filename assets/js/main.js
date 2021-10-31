// const fs = require('fs');

// Universal Variables

const storage = 'datadir';

const partsfile = storage + '/parts.json';
const outfitsfile = storage + '/outfits.json';

const regions = {
    "specific": {
        "main": {
            "head": [
                [0, 0, 32, 16]
            ],
            "torso": [
                [16, 16, 24, 16]
            ],
            "r-arm": [
                [32, 48, 16, 16]
            ],
            "l-arm": [
                [40, 16, 16, 16]
            ],
            "r-leg": [
                [16, 48, 16, 16]
            ],
            "l-leg": [
                [0, 16, 16, 16]
            ]
        },

        "outer": {
            "head": [
                [32, 0, 32, 16]
            ],
            "torso": [
                [16, 32, 24, 16]
            ],
            "r-arm": [
                [48, 48, 16, 16]
            ],
            "l-arm": [
                [40, 32, 16, 16]
            ],
            "r-leg": [
                [0, 48, 16, 16]
            ],
            "l-leg": [
                [0, 32, 16, 16]
            ]
        }
    },
    "allexcept": {
        "main": {
            "head": [
                [32, 0, 32, 16],
                [0, 16, 64, 48]
            ],
            "torso": [
                [0, 0, 64, 16],
                [0, 16, 16, 16],
                [40, 16, 24, 16],
                [0, 32, 64, 32]
            ],
            "r-arm": [
                [0, 0, 64, 48],
                [0, 48, 32, 16],
                [48, 48, 16, 16]
            ],
            "l-arm": [
                [0, 0, 64, 16],
                [0, 16, 40, 16],
                [56, 16, 24, 16],
                [0, 32, 64, 32]
            ],
            "r-leg": [
                [0, 0, 64, 48],
                [0, 48, 16, 16],
                [32, 48, 32, 16]
            ],
            "l-leg": [
                [0, 0, 64, 16],
                [16, 16, 48, 16],
                [0, 32, 64, 32]
            ]
        },

        "outer": {
            "head": [
                [0, 0, 32, 16],
                [0, 16, 64, 48]
            ],
            "torso": [
                [0, 0, 64, 32],
                [0, 32, 16, 16],
                [40, 32, 24, 16],
                [0, 48, 64, 32]
            ],
            "r-arm": [
                [0, 0, 64, 48],
                [0, 48, 48, 16]
            ],
            "l-arm": [
                [0, 0, 64, 32],
                [0, 32, 40, 16],
                [56, 32, 24, 16],
                [0, 48, 64, 32]
            ],
            "r-leg": [
                [0, 0, 64, 48],
                [16, 48, 48, 16]
            ],
            "l-leg": [
                [0, 0, 64, 32],
                [16, 32, 48, 16],
                [0, 48, 64, 32]
            ]
        }
    }
};
var skinViewer;

var parts;
var outfits;

var selectedpart;

// Files

async function init() {
    // Parts
    if (!window.localStorage.getItem('parts')) {
        window.localStorage.setItem('parts', JSON.stringify({
            'main': {
                'head': [],
                'torso': [],
                'r-arm': [],
                'l-arm': [],
                'r-leg': [],
                'l-leg': []
            },

            'outer': {
                'head': [],
                'torso': [],
                'r-arm': [],
                'l-arm': [],
                'r-leg': [],
                'l-leg': []
            }
        }));
    };

    // Outfits
    if (!window.localStorage.getItem('outfits')) {
        window.localStorage.setItem('outfits', JSON.stringify({
            'namelist': [],
            'fulllist': []
        }));
    }

    // Skin Viewer

    skinViewer = new skinview3d.SkinViewer({
        canvas: document.getElementById("skin_container"),
        width: 200,
        height: 300,
        loadCape: null
    });

    let control = skinview3d.createOrbitControls(skinViewer);
    control.enableRotate = true;
    control.enableZoom = false;
    control.enablePan = false;

    // Vars

    await sleep(1)

    parts = JSON.parse(window.localStorage.getItem('parts'));

    await sleep(0.5)

    listparts();

    outfits = JSON.parse(window.localStorage.getItem('outfits'));

    await sleep(0.5)

    listoutfits();

    //

    intro()
}

init()

// Intro

async function intro() {
    page('home');

    await sleep(1)

    document.getElementById('home-icon').classList.remove('scale-0');
    await sleep(1.1)
    document.getElementById('home-title').classList.add('full');
    await sleep(0.9)
    document.getElementById('home-subtitle').classList.add('h-8');
    document.getElementById('home-subtitle').classList.remove('h-0');
}

// Pages

var buttons = true;

async function page(id) {
    document.getElementById('wrapper').classList.remove('hidden')
    if (buttons) {
        const pages = ['home', 'builder', 'library', 'settings', 'stealer'];

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            document.getElementById(page).classList.add('hidden');
            document.getElementById(page + 'btn').classList.remove('selected');
        }

        document.getElementById(id).classList.remove('hidden');
        document.getElementById(id + 'btn').classList.add('selected');
    }
    await sleep(1)
    document.getElementById('wrapper').classList.remove('opacity-0');
}

// Skin Render

async function render(imagepath) {
    await clear()

    document.getElementById('skin').setAttribute('src', imagepath)

    await sleep(0.5)

    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.drawImage(document.getElementById('skin'), 0, 0)
}

function render3d(data) {
    skinViewer.loadSkin(data)
}

// Skin Mixer

async function clear() {
    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    await sleep(1)
    render3d(document.getElementById('canvas').toDataURL())

    return true
}

async function onlypart(name, layer) {
    var part = regions.allexcept[layer][name];
    var ctx = document.getElementById('canvas').getContext('2d');
    await sleep(0.25)

    for (let i = 0; i < part.length; i++) {
        const dim = part[i];
        ctx.clearRect(dim[0], dim[1], dim[2], dim[3]);
    }
    await sleep(0.1)

    document.getElementById('skin').setAttribute('src', document.getElementById('canvas').toDataURL())
    await sleep(0.1)
    return document.getElementById('skin').getAttribute('src');
}

function blankpart(name, layer) {
    var part = regions.specific[layer][name];
    var ctx = document.getElementById('canvas').getContext('2d');

    for (let i = 0; i < part.length; i++) {
        const dim = part[i];
        ctx.clearRect(dim[0], dim[1], dim[2], dim[3]);
    }

    render3d(document.getElementById('canvas').toDataURL())
}

async function loadb64(b64) {
    document.getElementById('skin').setAttribute('src', b64)

    await sleep(0.5)

    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.drawImage(document.getElementById('skin'), 0, 0)

    render3d(document.getElementById('canvas').toDataURL())
}

async function deconstructskin(path) {
    var partslist = ['head', 'torso', 'l-arm', 'r-arm', 'l-leg', 'r-leg', ]

    var percentage = 0;
    document.getElementById('filebar').setAttribute('percentage', percentage);
    document.getElementById('filebar').innerHTML = Math.round(percentage) + '%';

    await sleep(0.5)
    render(path);
    await sleep(0.5)
    parts.main.head.push(await onlypart('head', 'main'))

    for (let i = 0; i < partslist.length; i++) {
        const part = partslist[i];

        await sleep(0.5)
        render(path);
        await sleep(0.5)
        parts.main[part].push(await onlypart(part, 'main'))
        parts.main[part] = uniquify(parts.main[part])

        percentage += 8.33333333333;
        document.getElementById('filebar').setAttribute('percentage', percentage);
        document.getElementById('filebar').innerHTML = Math.round(percentage) + '%';

        await sleep(0.5)
        render(path);
        await sleep(0.5)
        parts.outer[part].push(await onlypart(part, 'outer'))
        parts.outer[part] = uniquify(parts.outer[part])

        percentage += 8.33333333333;
        document.getElementById('filebar').setAttribute('percentage', percentage);
        document.getElementById('filebar').innerHTML = Math.round(percentage) + '%';
    }

    render(path);
    await sleep(1)
    await saveoutfit()

    await sleep(5)

    window.localStorage.setItem('parts', JSON.stringify(parts));
    listparts()
    return
}

// Parts UI

function deletepart(type, layer, index) {
    document.getElementById('confirmdeletepart').classList.remove('hidden');
    document.getElementById('confirmdeletepartbtn').setAttribute('onclick', 'confirmdeletepart(\'' + type + '\', \'' + layer + '\', ' + index + ')')
}

async function confirmdeletepart(type, layer, index) {
    parts[layer][type].splice(index, 1);
    window.localStorage.setItem('parts', JSON.stringify(parts));
    listparts();
    document.getElementById('confirmdeletepart').classList.add('hidden');
}

function listparts() {
    var partslist = ['head', 'torso', 'l-arm', 'r-arm', 'l-leg', 'r-leg', ]
    for (let i = 0; i < partslist.length; i++) {
        const part = partslist[i];

        var html = '';

        for (let i = 0; i < parts.main[part].length; i++) {
            const element = parts.main[part][i];
            html += '<img title="Main ' + part + '" src="' + element + '" class="cursor-pointer mx-auto w-16 h-16 border-2 border-black" onclick="loadb64(\'' + element + '\')" oncontextmenu="deletepart(\'' + part + '\', \'main\', ' + i + ');return false;" onmouseover="render3d(\'' + element + '\')" onmouseout="render3d(document.getElementById(\'canvas\').toDataURL())">'
        };

        document.getElementById('main-' + part + '-grid').innerHTML = html;

        html = '';

        for (let i = 0; i < parts.outer[part].length; i++) {
            const element = parts.outer[part][i];
            html += '<img title="Outer ' + part + '" src="' + element + '" class="cursor-pointer mx-auto w-16 h-16 border-2 border-black" onclick="loadb64(\'' + element + '\')" oncontextmenu="deletepart(\'' + part + '\', \'outer\', ' + i + ');return false;" onmouseover="render3d(\'' + element + '\')" onmouseout="render3d(document.getElementById(\'canvas\').toDataURL())">'
        };

        document.getElementById('outer-' + part + '-grid').innerHTML = html;
    }
}

function partspage(page) {
    if (page == 'main') {
        document.getElementById('mainparts-display').classList.remove('hidden');
        document.getElementById('outerparts-display').classList.add('hidden');

        document.getElementById('mainparts-nav').classList.remove('hidden');
        document.getElementById('outerparts-nav').classList.add('hidden');

        document.getElementById('mainparts-btn').classList.add('selected')
        document.getElementById('outerparts-btn').classList.remove('selected')
    } else {
        document.getElementById('mainparts-display').classList.add('hidden');
        document.getElementById('outerparts-display').classList.remove('hidden');

        document.getElementById('mainparts-nav').classList.add('hidden');
        document.getElementById('outerparts-nav').classList.remove('hidden');

        document.getElementById('mainparts-btn').classList.remove('selected')
        document.getElementById('outerparts-btn').classList.add('selected')
    }
}

partspage('main')

// Outfits UI

function deleteoutfit(index) {
    document.getElementById('confirmdeleteoutfit').classList.remove('hidden');
    document.getElementById('confirmdeleteoutfitbtn').setAttribute('onclick', 'confirmdeleteoutfit(\'' + index + '\')')
}

async function confirmdeleteoutfit(index) {
    outfits.namelist.splice(index, 1);
    outfits.fulllist.splice(index, 1);
    window.localStorage.setItem('outfits', JSON.stringify(outfits));
    listoutfits();
    document.getElementById('confirmdeleteoutfit').classList.add('hidden');
}

document.getElementById('outfitname').addEventListener('keydown', function (event) {
    if (event.key == 'Enter') {
        saveoutfit()
        console.log(event.key)
    }
});

function nameoutfit() {
    document.getElementById('outfitname').classList.remove('h-0');
    document.getElementById('outfitname').classList.add('h-2', 'mb-3', 'p-2', 'border-2');
    document.getElementById('saveoutfit-btn').setAttribute('onclick', 'saveoutfit()');
}

async function saveoutfit() {
    if (outfits.namelist.includes(document.getElementById('outfitname').value)) {
        var index = outfits.fulllist.findIndex(function (item, i) {
            return item.name == document.getElementById('outfitname').value
        });
        outfits.fulllist[index].image = document.getElementById('canvas').toDataURL();
    } else {
        outfits.namelist.push(document.getElementById('outfitname').value)
        outfits.fulllist.push({
            'name': document.getElementById('outfitname').value,
            'image': document.getElementById('canvas').toDataURL()
        })
    }

    window.localStorage.setItem('outfits', JSON.stringify(outfits));
    listoutfits()

    document.getElementById('outfitname').classList.add('h-0');
    document.getElementById('outfitname').classList.remove('h-2', 'mb-3', 'p-2', 'border-2');
    document.getElementById('outfitname').value = '';
    document.getElementById('saveoutfit-btn').setAttribute('onclick', 'nameoutfit()');

    return
}

async function loadoutfit(image) {
    await clear();
    loadb64(image)
}

async function listoutfits() {
    document.getElementById('librarylist').innerHTML = '';

    for (let i = 0; i < outfits.fulllist.length; i++) {
        const outfit = outfits.fulllist[i];
        build(outfit.image)
        await sleep(0.025)
        var pngrender = document.getElementById('pngrendercanvas').toDataURL();
        var text = '<div class="flex-col cursor-pointer justify-start items-center inline-flex w-full flex-none border border-black p-1" onclick="loadoutfit(\'' + outfit.image + '\')" onmouseover="render3d(\'' + outfit.image + '\')" onmouseout="render3d(document.getElementById(\'canvas\').toDataURL())" oncontextmenu="deleteoutfit(\'' + i + '\');return false;"><marquee class="text-lg bg-blue-100 font-mono-2 w-full text-center truncate p-3 mb-3" scrollAmount="3">' + outfit.name + '</marquee><img src="' + pngrender + '" class="w-full" title="' + outfit.name + '"></img></div>';
        if (outfit.name.length < 12) {
            text = text.split('marquee').join('h3');
        }
        document.getElementById('librarylist').innerHTML += text;
    }
}

// Import Skin

var fileInput = document.getElementById('file');

async function readFiles() {
    document.getElementById('file').setAttribute('disabled', true);
    document.getElementById('fileimportbtn').classList.add('bg-red-300');
    document.getElementById('fileimportbtn').classList.remove('bg-green-400');

    buttons = false;
    document.getElementById('importing').classList.remove('hidden');
    await sleep(1)
    document.getElementById('importing').classList.remove('w-0', 'h-0');
    document.getElementById('importing').classList.add('w-full', 'h-full');

    document.getElementById('sidebar-buttons').classList.add('h-0');
    document.getElementById('sidebar-buttons').classList.remove('p-3', 'border-t-2');

    var percentage = 0;
    var increment = (100 / fileInput.files.length);
    document.getElementById('filetotalbar').setAttribute('percentage', percentage);
    document.getElementById('filetotalbar').innerHTML = 0 + ' / ' + fileInput.files.length;

    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i]

        console.log(file)

        document.getElementById('outfitname').value = file.name.replace('.png', '');

        var b64 = URL.createObjectURL(file);
        await deconstructskin(b64);
        console.log('Done file')
        percentage += increment
        document.getElementById('filetotalbar').setAttribute('percentage', percentage);
        document.getElementById('filetotalbar').innerHTML = (i + 1) + ' / ' + fileInput.files.length;
        await sleep(1)
    }
    console.log('done')
    document.getElementById('file').removeAttribute('disabled')
    document.getElementById('fileimportbtn').classList.add('bg-green-400');
    document.getElementById('fileimportbtn').classList.remove('bg-red-300');

    buttons = true;
    document.getElementById('importing').classList.add('w-0', 'h-0');
    document.getElementById('importing').classList.remove('w-full', 'h-full');

    document.getElementById('sidebar-buttons').classList.remove('h-0');
    document.getElementById('sidebar-buttons').classList.add('p-3', 'border-t-2');
    await sleep(5.1)
    document.getElementById('importing').classList.add('hidden');

    document.getElementById('filebar').setAttribute('percentage', 0);
    document.getElementById('filebar').innerHTML = 0;
    document.getElementById('filetotalbar').setAttribute('percentage', 0);
    document.getElementById('filetotalbar').innerHTML = 0;
}

document.getElementById('file').addEventListener('change', readFiles);

// Skin Stealer

async function getsteal() {
    const stealerusername = document.getElementById('stealer-input').value;
    const stealeruuid = await fetch('https://playerdb.co/api/player/minecraft/' + stealerusername)
        .then(resp => resp.json())
        .then(json => {
            return json.data.player.raw_id
        })
    const png = 'https://crafatar.com/skins/' + stealeruuid + '.png';
    document.getElementById('stealer-output').setAttribute('src', 'https://crafatar.com/renders/body/' + stealeruuid + '.png')
}

async function runsteal() {
    const stealerusername = document.getElementById('stealer-input').value;
    const stealeruuid = await fetch('https://playerdb.co/api/player/minecraft/' + stealerusername)
        .then(resp => resp.json())
        .then(json => {
            return json.data.player.raw_id
        })
    const png = 'https://crafatar.com/skins/' + stealeruuid + '.png';

    document.getElementById('outfitname').value = stealerusername;
    page('builder')
    buttons = false;
    document.getElementById('importing').classList.remove('hidden');
    await sleep(1)
    document.getElementById('importing').classList.remove('w-0', 'h-0');
    document.getElementById('importing').classList.add('w-full', 'h-full');

    document.getElementById('sidebar-buttons').classList.add('h-0');
    document.getElementById('sidebar-buttons').classList.remove('p-3', 'border-t-2');

    var b64 = await toDataURL(png);
    await deconstructskin(b64);

    buttons = true;
    document.getElementById('importing').classList.add('w-0', 'h-0');
    document.getElementById('importing').classList.remove('w-full', 'h-full');

    document.getElementById('sidebar-buttons').classList.remove('h-0');
    document.getElementById('sidebar-buttons').classList.add('p-3', 'border-t-2');
    await sleep(5.1)
    document.getElementById('importing').classList.add('hidden');
}

// Use Skin

// async function useskin() {
//     document.getElementById('uploadbar').value = 0;
//     document.getElementById('uploadbar').classList.remove('h-0');
//     document.getElementById('uploadbar').classList.add('h-2', 'mb-3');

//     await sleep(1)

//     var skin = document.getElementById('canvas').toDataURL();
//     render3d(skin);

//     let imgurl;

//     var formdata = new FormData();
//     formdata.append('image', skin.replace('data:image/png;base64,', ''));

//     var requestOptions = {
//         method: 'POST',
//         body: formdata,
//         redirect: 'follow'
//     };

//     fetch('https://api.imgbb.com/1/upload?key=3076ddb961e0a94b58dd7a80d908c76e&expiration=60', requestOptions)
//         .then(res => res.json())
//         .then(json => imgurl = json.data.url);

//     document.getElementById('uploadbar').value += 1;

//     await sleep(1)

//     fetch('https://api.minecraftservices.com/minecraft/profile/skins', {
//             method: 'POST',
//             headers: {
//                 'Authorization': 'Bearer ' + authdata.accessToken,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 'variant': 'slim',
//                 'url': imgurl
//             })
//         })
//         .then(res => res.json())
//         .then(json => console.log(json));

//     document.getElementById('uploadbar').value += 1;

//     await sleep(1)

//     document.getElementById('uploadbar').classList.add('h-0');
//     document.getElementById('uploadbar').classList.remove('h-2', 'mb-3');
// }

function exportskin() {
    var link = document.createElement('a');
    link.classList.add('hidden');
    link.setAttribute('download', 'skin');
    link.href = document.getElementById('canvas').toDataURL();
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// Reset Data

async function resetparts() {
    parts = {
        'main': {
            'head': [],
            'torso': [],
            'r-arm': [],
            'l-arm': [],
            'r-leg': [],
            'l-leg': []
        },

        'outer': {
            'head': [],
            'torso': [],
            'r-arm': [],
            'l-arm': [],
            'r-leg': [],
            'l-leg': []
        }
    };
    window.localStorage.setItem('parts', JSON.stringify(parts));
    init()
    document.getElementById('confirmdeleteallparts').classList.add('hidden');
}

async function resetoutfits() {
    outfits = {
        'namelist': [],
        'fulllist': []
    };
    window.localStorage.setItem('outfits', JSON.stringify(outfits));
    init()
    document.getElementById('confirmdeletealloutfits').classList.add('hidden');
}

// PNG Render

function build(imgData) {
    if (!imgData) return false;

    var settings = {}

    if (!settings.scale) {
        settings.scale = 10
    }
    if (!settings.draw) {
        settings.draw = 'model'
    }

    var canvas = document.getElementById('pngrendercanvas'),
        scratchCanv = document.createElement('canvas'),
        model = canvas.getContext('2d'),
        scratch = scratchCanv.getContext('2d'),
        skinimg = new Image(),
        heightMultiplier = settings.draw === 'head' ? 17.6 : 44.8

    scratchCanv.setAttribute('width', 64 * settings.scale)
    scratchCanv.setAttribute('height', 32 * settings.scale)

    canvas.setAttribute('width', 20 * settings.scale)
    canvas.setAttribute('height', heightMultiplier * settings.scale)

    document.body.append(canvas)

    skinimg.onload = function () {
        scratch.drawImage(skinimg, 0, 0, 64, 32, 0, 0, 64, 32)

        // Scale it
        scaleImage(scratch.getImageData(0, 0, 64, 32), scratch, 0, 0, settings.scale)

        // Draw the skinimg
        if (settings.draw === 'model') {
            drawModel(model, scratchCanv, scratch, settings.hat, settings.scale)
        } else {
            drawHead(model, scratchCanv, scratch, settings.hat, settings.scale)
        }
    }

    skinimg.src = imgData
}

function drawModel(model, scratchCanv, scratch, showHat, scale) {
    var scaleEight = 8 * scale

    // Left Leg
    // Left Leg - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.scale(-1, 1)
    model.drawImage(scratchCanv, 4 * scale, 20 * scale, 4 * scale, 12 * scale, -16 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale)

    // Right Leg
    // Right Leg - Right
    model.setTransform(1, 0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 26.4 / 1.2 * scale, 4 * scale, 12 * scale)

    // Right Leg - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 8 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale)

    // Arm Left
    // Arm Left - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.scale(-1, 1)
    model.drawImage(scratchCanv, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -20 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale)

    // Arm Left - Top
    model.setTransform(-1, 0.5, 1, 0.5, 0, 0)
    model.drawImage(scratchCanv, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 0, 16 * scale, 4 * scale, 4 * scale)

    // Body
    // Body - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 20 * scale, 20 * scale, 8 * scale, 12 * scale, 8 * scale, 20 / 1.2 * scale, scaleEight, 12 * scale)

    // Arm Right
    // Arm Right - Right
    model.setTransform(1, 0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 40 * scale, 20 * scale, 4 * scale, 12 * scale, 0, 16 / 1.2 * scale, 4 * scale, 12 * scale)

    // Arm Right - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale)

    // Arm Right - Top
    model.setTransform(-1, 0.5, 1, 0.5, 0, 0)
    model.scale(-1, 1)
    model.drawImage(scratchCanv, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -16 * scale, 16 * scale, 4 * scale, 4 * scale)

    drawHead(model, scratchCanv, scratch, showHat, scale)
}

function drawHead(model, scratchCanv, scratch, showHat, scale) {
    var scaleEight = 8 * scale
    // Head - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, scaleEight, scaleEight, scaleEight, scaleEight, 10 * scale, 13 / 1.2 * scale, scaleEight, scaleEight)

    // Head - Right
    model.setTransform(1, 0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 0, scaleEight, scaleEight, scaleEight, 2 * scale, 3 / 1.2 * scale, scaleEight, scaleEight)

    // Head - Top
    model.setTransform(-1, 0.5, 1, 0.5, 0, 0)
    model.scale(-1, 1)
    model.drawImage(scratchCanv, scaleEight, 0, scaleEight, scaleEight, -3 * scale, 5 * scale, scaleEight, scaleEight)

    if (!showHat) return

    // Hat - Front
    model.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 40 * scale, scaleEight, scaleEight, scaleEight, 10 * scale, 13 / 1.2 * scale, scaleEight, scaleEight)

    // Hat - Right
    model.setTransform(1, 0.5, 0, 1.2, 0, 0)
    model.drawImage(scratchCanv, 32 * scale, scaleEight, scaleEight, scaleEight, 2 * scale, 3 / 1.2 * scale, scaleEight, scaleEight)

    // Hat - Top
    model.setTransform(-1, 0.5, 1, 0.5, 0, 0)
    model.scale(-1, 1)
    model.drawImage(scratchCanv, 40 * scale, 0, scaleEight, scaleEight, -3 * scale, 5 * scale, scaleEight, scaleEight)
}

function scaleImage(imageData, context, dx, dy, scale) {
    var width = imageData.width,
        height = imageData.height

    context.clearRect(0, 0, width, height) //Clear the spot where it originated from

    for (var y = 0; y < height; y++) { // Height original
        for (var x = 0; x < width; x++) { // Width original
            // Gets original colour, then makes a scaled square of the same colour
            var index = (x + y * width) * 4,
                fill = imageData.data[index]

            fill += ',' + imageData.data[index + 1] + ',' + imageData.data[index + 2] + ',' + imageData.data[index + 3]

            context.fillStyle = 'rgba(' + fill + ')'
            context.fillRect(dx + x * scale, dy + y * scale, scale, scale)
        }
    }
}

// Version Control

// Extras

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, (s * 1000)));
}

function uniquify(array) {
    let newarray = Array.from(new Set(array));

    var index = newarray.indexOf('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAhElEQVR4Xu3VAREAMAwCseLfdIV85qAcGbv4W/z+E4AGxBNAIF4AnyACCMQTQCBeACuAAALxBBCIF8AKIIBAPAEE4gWwAgggEE8AgXgBrAACCMQTQCBeACuAAALxBBCIF8AKIIBAPAEE4gWwAgggEE8AgXgBrAACCMQTQCBeACuAQJ3AA2jYAEGs/2CBAAAAAElFTkSuQmCC');
    if (index > -1) {
        newarray.splice(index, 1);
    }

    index = newarray.indexOf('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAo0lEQVR4Xu3VMRXEMBDE0ASI+QMzkByCe9uvflpXlqXM+8S/N37/BwAGxAlIIC6An6AEJBAnIIG4AFZAAhKIE5BAXAArIAEJxAlIIC6AFZCABOIEJBAXwApIQAJxAhKIC2AFJCCBOAEJxAWwAhKQQJyABOIC7F+Be+93zvlrugQkECcggbgA+1dgemAJTIS2nzNg+wtP92PARGj7OQO2v/B0vx8czwRBQWp0ZwAAAABJRU5ErkJggg==');
    if (index > -1) {
        newarray.splice(index, 1);
    }

    index = newarray.indexOf('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAKNJREFUeF7t1TEVxDAQxNAEiPkDM5Acgnvbr35aV5alzPvEvzd+/wcABsQJSCAugJ+gBCQQJyCBuABWQAISiBOQQFwAKyABCcQJSCAugBWQgATiBCQQF8AKSEACcQISiAtgBSQggTgBCcQFsAISkECcgATiAuxfgXvvd875a7oEJBAnIIG4APtXYHpgCUyEtp8zYPsLT/djwERo+zkDtr/wdL8fHM8EQUFqdGcAAAAASUVORK5CYII=');
    if (index > -1) {
        newarray.splice(index, 1);
    }

    return newarray
}

function view(id) {
    document.getElementById(id).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });
}

async function toDataURL(url) {
    var virtualcanvas = document.createElement('canvas');
    var virtualctx = virtualcanvas.getContext('2d');
    virtualcanvas.setAttribute('width', 64);
    virtualcanvas.setAttribute('height', 64);

    myimage = new Image();
    myimage.onload = function () {
        virtualctx.drawImage(myimage, 0, 0);
    }
    myimage.src = url;
    await sleep(2);
    console.log(virtualcanvas.toDataURL())
    return virtualcanvas.toDataURL()
}

function checkOverflow(el) {
    var curOverflow = el.style.overflow;

    if (!curOverflow || curOverflow === "visible")
        el.style.overflow = "hidden";

    var isOverflowing = el.clientWidth < el.scrollWidth ||
        el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;

    return isOverflowing;
}