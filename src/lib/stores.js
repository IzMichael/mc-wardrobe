import { writable, get } from 'svelte/store';
import { BodyPart } from 'skinview3d';

// Default Value for Client Store
export const defaultClient = {
    config: {
        outfitLayout: 'row',
        mcfont: true
    },
    parts: {
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
    },
    outfits: [
        {
            'id': 'BLANK_DEFAULT',
            'name': 'Blank',
            'img': 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
            'tags': ['Default']
        },
        {
            'id': 'STEVE_DEFAULT',
            'name': 'Steve',
            'img': '/assets/img/steve.png',
            'tags': ['Default']
        },
    ]
};

// Default Value for Auth Store
export const defaultAuth = {
    uuid: '',
    username: '',
    accessToken: '',
    msRefresh: '',
    profile: {}
};

export const msURL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=0660aaf9-9acc-47e3-a52c-0e6c29d2a1e7&response_type=code&redirect_uri=http://localhost:5000/msauth&response_mode=query&scope=XboxLive.signin&state=12345&prompt=select_account&code_challenge=YTFjNjI1OWYzMzA3MTI4ZDY2Njg5M2RkNmVjNDE5YmEyZGRhOGYyM2IzNjdmZWFhMTQ1ODg3NDcxY2Nl';

// LocalStorage Persistent ClientData
// Contains Individual Parts, Outfits, Settings, Etc.
const storedclient = window.localStorage.getItem('mcwardrobe-client-data');
export const client = writable(JSON.parse(storedclient || JSON.stringify(defaultClient)));
client.subscribe(value => {
    localStorage.setItem('mcwardrobe-client-data', JSON.stringify(value));
});

// Sync LocalStorage with Other Tabs
// window.addEventListener('storage', event => {
//     if (event.key == 'mcwardrobe-client-data' && event.newValue != JSON.stringify(get(client))) {
//         client.set(JSON.parse(event.newValue));
//     };
// });

// LocalStorage Persistent AuthData
// Contains MC User's UUID, MC Access Token, MS Refresh Token, Etc.
const storedauth = window.localStorage.getItem('mcwardrobe-auth-data');
export const auth = writable(JSON.parse(storedauth || JSON.stringify(defaultAuth)));
auth.subscribe(value => {
    localStorage.setItem('mcwardrobe-auth-data', JSON.stringify(value));
});

// 3D Skin Renderer
export const render = writable(''); // Image URL to Render
export const renderer = writable({}); // 3dskinview Instance

// 2D Skin Renderer
export const map = writable({}); // 2D Context for Canvas

// Renders the 2D Skin in the 3D Renderer
export function renderMap() {
    render.set(get(map).canvas.toDataURL());
};

// Renders an Image URL to the 2D Renderer
export async function mapSkin(url, clear) {
    if (!url) return false;
    let ctx = get(map);
    let img = new Image();
    await new Promise(r => img.onload = r, img.src = url);
    if (clear == true) ctx.clearRect(0, 0, 64, 64);
    ctx.drawImage(img, 0, 0);
    return true;
};

// Object for Skin Map
// Contains layer and part arrays, with helper functions for extracting coordinates
export const skinmap = {
    parts: ['head', 'torso', 'r-arm', 'l-arm', 'r-leg', 'l-leg'],
    partLabels: ['Head', 'Torso', 'Right Arm', 'Left Arm', 'Right Leg', 'Left Leg'],
    layers: ['main', 'outer'],
    layerLabels: ['Main', 'Outer'],
    layers3d: {
        'main': 'inner',
        'outer': 'outer'
    },
    parts3d: {
        'head': 'head',
        'torso': 'body',
        'l-arm': 'leftArm',
        'r-arm': 'rightArm',
        'l-leg': 'leftLeg',
        'r-leg': 'rightLeg',
    },
    get: (layer, part) => {
        return mappings[layer][part][0];
    },
    exclude: (layer, part) => {
        let parts = Object.keys(mappings[layer]).filter(a => a != part);
        let coords = [];

        for (const partb of parts) {
            coords.push(...mappings.main[partb]);
            coords.push(...mappings.outer[partb]);
        };

        if (layer == 'main') {
            coords.push(...mappings.outer[part]);
        } else {
            coords.push(...mappings.main[part]);
        };

        return coords;
        // return mappings[layer].filter(a => a != part);
    },
    whitespace: (layer, part) => {
        return whitespace[layer][part];
    },
};

// Only render specified part
export function exclusiveRender(layer, part) {
    let parts = Object.values(get(renderer).playerObject.skin).filter(a => a instanceof BodyPart);
    let correct = parts.find(a => a.name == skinmap.parts3d[part]);
    
    parts.forEach(a => {
        skinmap.layers.forEach(b => {
            a[skinmap.layers3d[b] + 'Layer'].visible = false;
        });
    });

    correct[skinmap.layers3d[layer] + 'Layer'].visible = true;
};

// Render all parts
export function allRender() {
    let parts = Object.values(get(renderer).playerObject.skin).filter(a => a instanceof BodyPart);
    parts.forEach(a => {
        skinmap.layers.forEach(b => {
            a[skinmap.layers3d[b] + 'Layer'].visible = true;
        });
    });
};

// Map of Skin Part Coordinates
export const mappings = {
    'main': {
        'head': [
            [0, 0, 32, 16]
        ],
        'torso': [
            [16, 16, 24, 16]
        ],
        'l-arm': [
            [32, 48, 16, 16]
        ],
        'r-arm': [
            [40, 16, 16, 16]
        ],
        'l-leg': [
            [16, 48, 16, 16]
        ],
        'r-leg': [
            [0, 16, 16, 16]
        ]
    },

    'outer': {
        'head': [
            [32, 0, 32, 16]
        ],
        'torso': [
            [16, 32, 24, 16]
        ],
        'l-arm': [
            [48, 48, 16, 16]
        ],
        'r-arm': [
            [40, 32, 16, 16]
        ],
        'l-leg': [
            [0, 48, 16, 16]
        ],
        'r-leg': [
            [0, 32, 16, 16]
        ]
    }
};

// Map of Whitespaces in Skin Parts
export const whitespace = {
    'main': {
        'head': [
            [0, 0, 8, 8],
            [24, 0, 8, 8]
        ],
        'torso': [
            [16, 16, 4, 4],
            [36, 16, 4, 4]
        ],
        'l-arm': [
            [32, 48, 4, 4],
            [44, 48, 4, 4]
        ],
        'r-arm': [
            [40, 16, 4, 4],
            [52, 16, 4, 4]
        ],
        'l-leg': [
            [16, 48, 4, 4],
            [28, 48, 4, 4]
        ],
        'r-leg': [
            [0, 16, 4, 4],
            [12, 16, 4, 4]
        ]
    },

    'outer': {
        'head': [
            [32, 0, 8, 8],
            [56, 0, 8, 8]
        ],
        'torso': [
            [16, 34, 4, 4],
            [36, 32, 4, 4]
        ],
        'l-arm': [
            [48, 48, 4, 4],
            [60, 48, 4, 4]
        ],
        'r-arm': [
            [40, 32, 4, 4],
            [52, 32, 4, 4]
        ],
        'l-leg': [
            [0, 48, 4, 4],
            [12, 48, 4, 4]
        ],
        'r-leg': [
            [0, 32, 4, 4],
            [12, 32, 4, 4]
        ]
    }
};

export const color = writable('#000000');

export const templates = {
    'main': {
        'head': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAARRJREFUeF7tlrENwjAURJ20jJGSCVgjBeNSsgBCNFgsggAxQOwqehd4aRP5TnfP/2conecyTe/WJ/v6aJ4wltfQ0yDfd80ZgAR4BZwB7SFYSynj4id/MAQNYNsEnOa5eccPu2tzTd/Pz+b7W/0SsvwcS+mu4jX/EwYDkACvgDOgNWQcgm6BH1+Da+7YLZyN/oQkBGQACS2QHiSATD9BWwISWiA9SACZfoK2BCS0QHqQADL9BG0JSGiB9CABZPoJ2hKQ0ALpQQLI9BO0JSChBdKDBJDpJ2hLQEILpAcJINNP0JaAhBZIDxJApp+gLQEJLZAeJIBMP0FbAhJaID1IAJl+grYEJLRAepAAMv0EbQlIaIH08AG3CHBBxW3ryQAAAABJRU5ErkJggg==',
        'torso': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAQxJREFUeF7tmCEOg0AURMFwieoiqKjqCeowHArJLbhOVUVD0h6GWhaxhskmw391hDD7mf9m99O6Cv6rg79/hQEQENwBIhAcADZBIkAEgjtABIIDwClABIiA2IH59llzkpe+ya74nK5FqZQvhgEQECwCc7ckmb8/2mzG369vcv+3pNf7h8d1kMd0u8ZhcQyAACLAHrDdVNgEOQU4BpkDcg4wCDEJnmwUFv+dUFzu8LdA8YrFC2KA2FA7OQiwa5m4YAgQG2onBwF2LRMXDAFiQ+3kIMCuZeKCIUBsqJ0cBNi1TFwwBIgNtZODALuWiQuGALGhdnIQYNcyccEQIDbUTg4C7FomLhgCxIbayf0BdXmIQboCcF8AAAAASUVORK5CYII=',
        'r-arm': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAQFJREFUeF7tlzEOgkAQRSEeAzyEjUu4JZ2HcD2GttxIW2YLEoqffJlnR2Imw5v3h92+S/7rk79/BwAMSE6ACCQXgCVIBIhAcgJEILkAfAWIABH4MwK36f3dtlxKCW/wWC6HrD70ZwdWAMCAZBFolb9PMfOvZw3JHK5jeF4/827M7XcAAJrMYwARYAeEJccS5CvAZ5BzwJYAB6GznwTb62+tJ98B6iu4/V0AAGICGCAGbF8eA+xHJG4QA8SA7ctjgP2IxA1igBiwfXkMsB+RuEEMEAO2L48B9iMSN4gBYsD25THAfkTiBjFADNi+PAbYj0jcIAaIAduXxwD7EYkbTG/AD/d5ZEGhak/rAAAAAElFTkSuQmCC',
        'l-arm': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAANFJREFUeF7t1iEOwkAURdHWsQFkHZvAoairZkEsA9c0QeNYHdgZVTETQvJOXUWb6e27//1xCL/G8O8fAJCAcAIUCA+AIUgBCoQToEB4ALQABSgQToAC4QHQAhSgQDgBCoQHQAtQgALhBCgQHgAtQAEKhBOgQHgAtAAFKBBOgALhAdACFKBAOAEK/FsA5tvrU55pOl2rIz7uh64/revLesAEQALCFNiL/LpulVmX87G6fz+XJo2bHv6F8wBIAAXMgJKAIagF1KA9oCRgEbIJtq3CX2l5ZEGQRenaAAAAAElFTkSuQmCC',
        'r-leg': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAPRJREFUeF7tmLENwkAQBP0F0QgVkNMEIaIaKgCEkBxBQgZtkBNC+g/ZhnPjzJYv2L3Z+9O3qfjTiuufNEACijtgBIoD4BA0AkaguANGoDgAngJGwAj8OLB5vz79p8N8Gf54LFcoav7EaIAEFIvA4rgfMv+83obMr3fb4f1+OqNmQtMACTACzoB+qjkEPQU8Bt0DegdchNwE4auwFyLFHUDd7iS91IDENVKNBJC6mWiRgMQ1Uo0EkLqZaJGAxDVSjQSQuplokYDENVKNBJC6mWiRgMQ1Uo0EkLqZaJGAxDVSjQSQuplokYDENVKNBJC6mWgpT8AXUT+UQd/vpNYAAAAASUVORK5CYII=',
        'l-leg': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAANNJREFUeF7t1iEOwkAURdHWoVlKNZJNUIvrnmpZCgbWgSSpw1E7oxrCJJC8U1fTmd68+9/vu/CnD///DgAJCCdAgfAAGIIUoEA4AQqEB0ALUIAC4QQoEB4ALUABCoQToEB4ALQABSgQToAC4QHQAhSgQDgBCoQHQAtQgALhBCgQHgAtQAEKhBOgQOsA7M/ju/zm7niojnicpr+C3vwyAEhAmAJbkR+WVzUDrrd79f6cL801/GSufX04ABvOSwAFzABDsCSgBdSgPcAiVBKwCf54FV4BsiB8QZiCT9wAAAAASUVORK5CYII='
    },
    'outer': {
        'head': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAPtJREFUeF7t17uNAkEUBVEwCWVJgBiQ0DqkQDIQDHHgEMYQxUpLBs89fGrcHuleXlV3D+vViz/Xn+3/VHH/exh/weZ8WU8vjIuvMJsGkAFtgc6ADsFhAt0C734NPk6ncY/fl2W8jXfH47j+d7uN6/w7oAFkQFugM2A6pToEuwU+/BrUf7n5d0ADwBPIAAyAx2cAR4ALZAAGwOMzgCPABTIAA+DxGcAR4AIZgAHw+AzgCHCBDMAAeHwGcAS4QAZgADw+AzgCXCADMAAenwEcAS6QARgAj88AjgAXyAAMgMdnAEeAC2QABsDjM4AjwAUyAAPg8RnAEeACX2/AE6AgZaltpetGAAAAAElFTkSuQmCC',
        'torso': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAPZJREFUeF7tmCESgzAQRRNb0xN0uEY9uqK3QIDsTXoRFLaiMxhuUcEtCjaYNRuz/IeF2YSf97KBnMSvLP7+iQAgQDwBFBAHgE0QBVBAPAEUEAeALoACKCCeAAqIA0AXQAEUEE8ABcQBoAugAAqIJ4AC4gDQBaor8O3XzaJqTqMJ3evdVZ+TNWD1wQgAAsQU+Ay/g/PLfzIdv+fH4f6tvZrPN89LdU3LAd3FCQACUIA9oNxU2ATpArRBzgFWAhyEOAme7Cgc/Y+S+1uAAIInAAHBF9A9fQhwRxi8AAQEX0D39CHAHWHwAhAQfAHd04cAd4TBC8gTsAMUJWxBeJUHKAAAAABJRU5ErkJggg==',
        'r-arm': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAPRJREFUeF7tl7ENg0AQBKECREwPlpBLwCklAB3RBE7dgjtwGY6dkULKJZYITlp7hwwJvf73Z+6OsjB/SvPzFwQAAeYJoIA5ABRBFEAB8wRQwBwAugAKoIB5AihgDgBdAAVQwDwBFDAHgC6AAihgngAKmANAF/g5Ba5Dsx2prW5rgPg5fU6d6dTHCroQAASYKdCO8cB1F53vL0Mw8z4/wvtreX/VXL4GEAAEoEDo+9QAiiBdILQ52iBzAIMQk+Axgb8bhbN/weX/BQggOQEISA5YfnkIkL+i5A1CQHLA8stDgPwVJW8QApIDll8eAuSvKHmD9gTsNJR0QeI3QBgAAAAASUVORK5CYII=',
        'l-arm': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAMpJREFUeF7t1rERglAQRVFowlRmTLQBaYfM2BKogXoILMCOnNH07+9A3iH74V7e3bfjEP6N4fMPAEhAOAEKhAfAEqQABcIJUCA8AFqAAhQIJ0CB8ABoAQpQIJwABcIDoAUoQIFwAhQID4AWoAAFwglQIDwAWoACFAgnQIHwAGgBClAgnAAFjhaA57Z825mu93MZ8TGv5acfLgEASECYAn3kb/NUnH+99/I+fS7l/fc7AIDOeQmggB1gCbYEtIAadAc4hFoCLsHuFP4BCP9c5aU4XvUAAAAASUVORK5CYII=',
        'r-leg': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAPxJREFUeF7tmL0NwjAQRm1+dmACEBJFkDIQKRBYQoiSEWgp2CMLZIoMRFo7SFTXnL+Xzo3lfPfenZMYxJ8o/v6BACBAPAEUEAeAJogCKCCeAAqIA8AUQAEUEE8ABcQBYAqgAAqIJ4AC4gAwBVAABcQTQAFxAJgCPwpcn/dvTsVht8+Wi3DrLlVpQwDzHgABfxRYxlVIp3NdCnSPVDjfNscCin4civV2vSnWn9fbdSCRACAABegBeVejCTIFGIPcA/IEuAhxE6z8KswfIfEEXH/JWdSOACxS9LwHBHiunsXZIcAiRc97QIDn6lmcHQIsUvS8BwR4rp7F2eUJmAAoSGRBD29GHgAAAABJRU5ErkJggg==',
        'l-leg': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAM5JREFUeF7t1rEVgkAURFE2sgpjQjKPAc3YAMUYmVmAbVCBJdAAJWi6qwExzN2MPST7zrw/v3Thp4S/vwNAAsIJUCA8AIYgBSgQToAC4QHQAhSgQDgBCoQHQAtQgALhBCgQHgAtQAEKhBOgQHgAtAAFKBBOgALhAdACFKBAOAEKhAdAC1CAAuEEKPAbgPF++9R3y/XU/LJcHoeC9vcYACQgTIGtyK+vdzMDhnPffM/Tc9czoQCw4bwEUMAMMARrAlpADdoDLEI1AZvgzlfhL+OBdEHi07nTAAAAAElFTkSuQmCC'
    }
};