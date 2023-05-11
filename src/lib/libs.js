import { get } from 'svelte/store';
import { client, skinmap } from '$lib/stores.js';
import { colord } from 'colord';

export async function deconstruct(img, title) {
    title = title.replaceAll(/.png|.jpg|.jpeg|.bmp/gi, '');
    let workerA = document.createElement('canvas');
    workerA.width = 64;
    workerA.height = 64;
    let ctxA = workerA.getContext('2d');
    ctxA.drawImage(img, 0, 0);

    skinmap.parts.forEach(part => {
        skinmap.layers.forEach(async layer => {
            let workerB = document.createElement('canvas');
            workerB.width = 64;
            workerB.height = 64;
            let ctxB = workerB.getContext('2d');
            ctxB.drawImage(img, 0, 0);

            let except = skinmap.exclude(layer, part);
            except.forEach(coord => {
                ctxB.clearRect(...coord);
            });

            if (await isBlank(workerB) != true) {
                let clinew = get(client);
                let newpart = workerB.toDataURL('image/png');
                if (!clinew.parts[layer][part].map(a => a.img).includes(newpart)) {
                    clinew.parts[layer][part] = [...new Set([...get(client).parts[layer][part], {
                        'id': uuidv4(),
                        'title': title,
                        'img': newpart
                    }])];
                    client.set(clinew);
                };
            };
        });
    });

    let clinew = get(client);
    let newimg = workerA.toDataURL('image/png');
    if (!clinew.outfits.map(a => a.img).includes(newimg)) {
        clinew.outfits.push({
            'id': uuidv4(),
            'name': title,
            'img': newimg,
            'tags': ['Imported']
        });
        client.set(clinew);
    };

    return;
};

// export async function getImg(url) {
//     if (!url) return false;
//     let img = new Image();
//     img.crossOrigin = 'anonymous';
//     await new Promise(r => img.onload = r, img.src = url);
//     return img;
// };

export async function getImg(source) {
    const image = document.createElement('img');
    return new Promise((resolve, reject) => {
        image.onload = () => { 
            resolve(image);
        };
        image.onerror = reject;
        image.crossOrigin = 'anonymous';
        if (typeof source == 'string') {
            image.src = source;
        } else {
            if (source.crossOrigin !== undefined) {
                image.crossOrigin = source.crossOrigin;
            };
            if (source.referrerPolicy !== undefined) {
                image.referrerPolicy = source.referrerPolicy;
            };
            image.src = source.src;
        };
    });
};

export async function getColors(canvas) {
    let context = canvas.getContext('2d');
    let imageWidth = canvas.width;
    let imageHeight = canvas.height;
    let imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    let data = imageData.data;
    let colorList = [];

    // quickly iterate over all pixels
    for (let i = 0, n = data.length; i < n; i += 4) {
        let r  = data[i];
        let g  = data[i + 1];
        let b  = data[i + 2];
        let a  = data[i + 3]; // Alpha Value
        var hex = colord({ r, g, b, a }).toHex();
        if (colorList.indexOf(hex) < 1){
            colorList.push(hex);
        };
    }
    return [...new Set(colorList)];
};

export async function isBlank(canvas) {
    // let canvas = document.createElement('canvas');
    // let ctx = canvas.getContext('2d');
    // canvas.width = 64;
    // canvas.height = 64;
    // ctx.drawImage(img, 0, 0);
    let colors = await getColors(canvas);
    if (colors.length == 1 && colors[0] == '#000000') {
        return true;
    } else {
        return false;
    };
};

export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

export async function cropPart(coords, src, square = true) {
    // Prep variables, virtual canvas
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    canvas.classList.add('crispImage');
    
    // Convert input to img element for canvas drawing
    let img = await getImg(src);

    if (square == true) {
        // If part selection is wider than it is tall
        if (coords[2] > coords[3]) {
            // Part selection is wider than it is tall
            // Use part selection width for both axes, to maintain squarity
            canvas.width = coords[2];
            canvas.height = coords[2];

            // Draw skin with part centred in frame
            ctx.drawImage(img, -coords[0], -coords[1] + (canvas.height - coords[1]) / 4);
        } else {
            // Part selection is taller than it is wide
            // Use part selection height for both axes, to maintain squarity
            canvas.width = coords[3];
            canvas.height = coords[3];

            // Draw skin with part centred in frame 
            ctx.drawImage(img, -coords[0], -coords[1]);
        };
    } else {
        canvas.width = coords[2];
        canvas.height = coords[3];
        ctx.drawImage(img, -coords[0], -coords[1]);
    };

    // ctx.drawImage(img, 0 - coords[0], 0 - coords[1]);

    let dataurl = canvas.toDataURL('image/png');
    return dataurl;
};

export function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, (s * 1000)));
};

export async function modernise(img) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    let width = img.width;
    ctx.drawImage(img, 0, 0);

    const scale = computeSkinScale(width);
    const copySkin = (sX, sY, w, h, dX, dY, flipHorizontal) => copyImage(ctx, sX * scale, sY * scale, w * scale, h * scale, dX * scale, dY * scale, flipHorizontal);
    copySkin(4, 16, 4, 4, 20, 48, true); // Top Leg
    copySkin(8, 16, 4, 4, 24, 48, true); // Bottom Leg
    copySkin(0, 20, 4, 12, 24, 52, true); // Outer Leg
    copySkin(4, 20, 4, 12, 20, 52, true); // Front Leg
    copySkin(8, 20, 4, 12, 16, 52, true); // Inner Leg
    copySkin(12, 20, 4, 12, 28, 52, true); // Back Leg
    copySkin(44, 16, 4, 4, 36, 48, true); // Top Arm
    copySkin(48, 16, 4, 4, 40, 48, true); // Bottom Arm
    copySkin(40, 20, 4, 12, 40, 52, true); // Outer Arm
    copySkin(44, 20, 4, 12, 36, 52, true); // Front Arm
    copySkin(48, 20, 4, 12, 32, 52, true); // Inner Arm
    copySkin(52, 20, 4, 12, 44, 52, true); // Back Arm

    let image = await getImg(canvas.toDataURL('image/png'));
    return image;
};

export function inferModelType(canvas, context) {
    // The right arm area of *default* skins:
    // (44,16)->*-------*-------*
    // (40,20)  |top    |bottom |
    // \|/      |4x4    |4x4    |
    //  *-------*-------*-------*-------*
    //  |right  |front  |left   |back   |
    //  |4x12   |4x12   |4x12   |4x12   |
    //  *-------*-------*-------*-------*
    // The right arm area of *slim* skins:
    // (44,16)->*------*------*-*
    // (40,20)  |top   |bottom| |<----[x0=50,y0=16,w=2,h=4]
    // \|/      |3x4   |3x4   | |
    //  *-------*------*------***-----*-*
    //  |right  |front |left   |back  | |<----[x0=54,y0=20,w=2,h=12]
    //  |4x12   |3x12  |4x12   |3x12  | |
    //  *-------*------*-------*------*-*
    // Compared with default right arms, slim right arms have 2 unused areas.
    //
    // The same is true for left arm:
    // The left arm area of *default* skins:
    // (36,48)->*-------*-------*
    // (32,52)  |top    |bottom |
    // \|/      |4x4    |4x4    |
    //  *-------*-------*-------*-------*
    //  |right  |front  |left   |back   |
    //  |4x12   |4x12   |4x12   |4x12   |
    //  *-------*-------*-------*-------*
    // The left arm area of *slim* skins:
    // (36,48)->*------*------*-*
    // (32,52)  |top   |bottom| |<----[x0=42,y0=48,w=2,h=4]
    // \|/      |3x4   |3x4   | |
    //  *-------*------*------***-----*-*
    //  |right  |front |left   |back  | |<----[x0=46,y0=52,w=2,h=12]
    //  |4x12   |3x12  |4x12   |3x12  | |
    //  *-------*------*-------*------*-*
    //
    if (canvas.width < 1) return 'default';
    // If there is a transparent pixel in any of the 4 unused areas, the skin must be slim,
    // as transparent pixels are not allowed in the first layer.
    // If the 4 areas are all black or all white, the skin is also considered as slim.
    const scale = computeSkinScale(canvas.width);
    // const context = canvas.getContext('2d');
    const checkTransparency = (x, y, w, h) => hasTransparency(context, x * scale, y * scale, w * scale, h * scale);
    const checkBlack = (x, y, w, h) => isAreaBlack(context, x * scale, y * scale, w * scale, h * scale);
    const checkWhite = (x, y, w, h) => isAreaWhite(context, x * scale, y * scale, w * scale, h * scale);
    const isSlim = (checkTransparency(50, 16, 2, 4) ||
        checkTransparency(54, 20, 2, 12) ||
        checkTransparency(42, 48, 2, 4) ||
        checkTransparency(46, 52, 2, 12)) ||
        (checkBlack(50, 16, 2, 4) &&
            checkBlack(54, 20, 2, 12) &&
            checkBlack(42, 48, 2, 4) &&
            checkBlack(46, 52, 2, 12)) ||
        (checkWhite(50, 16, 2, 4) &&
            checkWhite(54, 20, 2, 12) &&
            checkWhite(42, 48, 2, 4) &&
            checkWhite(46, 52, 2, 12));
    return isSlim ? 'slim' : 'default';
};

function isAreaBlack(context, x0, y0, w, h) {
    const imgData = context.getImageData(x0, y0, w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const offset = (x + y * w) * 4;
            if (!(imgData.data[offset + 0] === 0 &&
                imgData.data[offset + 1] === 0 &&
                imgData.data[offset + 2] === 0 &&
                imgData.data[offset + 3] === 0xff)) {
                return false;
            }
        }
    }
    return true;
};

function isAreaWhite(context, x0, y0, w, h) {
    const imgData = context.getImageData(x0, y0, w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const offset = (x + y * w) * 4;
            if (!(imgData.data[offset + 0] === 0xff &&
                imgData.data[offset + 1] === 0xff &&
                imgData.data[offset + 2] === 0xff &&
                imgData.data[offset + 3] === 0xff)) {
                return false;
            }
        }
    }
    return true;
};

function computeSkinScale(width) {
    return width / 64.0;
};

function hasTransparency(context, x0, y0, w, h) {
    const imgData = context.getImageData(x0, y0, w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const offset = (x + y * w) * 4;
            if (imgData.data[offset + 3] !== 0xff) {
                return true;
            }
        }
    }
    return false;
};

export function copyImage(context, sX, sY, w, h, dX, dY, flipHorizontal) {
    const imgData = context.getImageData(sX, sY, w, h);
    if (flipHorizontal) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < (w / 2); x++) {
                const index = (x + y * w) * 4;
                const index2 = ((w - x - 1) + y * w) * 4;
                const pA1 = imgData.data[index];
                const pA2 = imgData.data[index + 1];
                const pA3 = imgData.data[index + 2];
                const pA4 = imgData.data[index + 3];
                const pB1 = imgData.data[index2];
                const pB2 = imgData.data[index2 + 1];
                const pB3 = imgData.data[index2 + 2];
                const pB4 = imgData.data[index2 + 3];
                imgData.data[index] = pB1;
                imgData.data[index + 1] = pB2;
                imgData.data[index + 2] = pB3;
                imgData.data[index + 3] = pB4;
                imgData.data[index2] = pA1;
                imgData.data[index2 + 1] = pA2;
                imgData.data[index2 + 2] = pA3;
                imgData.data[index2 + 3] = pA4;
            }
        }
    }
    context.putImageData(imgData, dX, dY);
};

export async function fixOpaqueSkin(img, format1_8 = false) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    let width = img.width;
    ctx.drawImage(img, 0, 0);
    const scale = computeSkinScale(width);
    const clearArea = (x, y, w, h) => ctx.clearRect(x * scale, y * scale, w * scale, h * scale);

    clearArea(0, 0, 8, 8);
    clearArea(24, 0, 16, 8);
    clearArea(56, 0, 8, 8);
    
    clearArea(0, 16, 4, 4);
    clearArea(12, 16, 8, 4);
    clearArea(36, 16, 8, 4);
    clearArea(52, 16, 4, 4);

    // clearArea(56, 16, 8, 32);

    clearArea(0, 32, 4, 4);
    clearArea(12, 32, 8, 4);
    clearArea(36, 32, 8, 4);
    clearArea(52, 32, 4, 4);

    clearArea(0, 48, 4, 4);
    clearArea(12, 48, 8, 4);
    clearArea(28, 48, 8, 4);
    clearArea(44, 48, 8, 4);
    clearArea(60, 48, 4, 4);

    // see https://github.com/bs-community/skinview3d/issues/15
    // see https://github.com/bs-community/skinview3d/issues/93
    // check whether the skin has opaque background
    if (format1_8) {
        if (hasTransparency(ctx, 0, 0, width, width)) return await getImg(canvas.toDataURL('image/png'));
    } else {
        if (hasTransparency(ctx, 0, 0, width, width / 2)) return await getImg(canvas.toDataURL('image/png'));
    };
    clearArea(40, 0, 8, 8); // Helm Top
    clearArea(48, 0, 8, 8); // Helm Bottom
    clearArea(32, 8, 8, 8); // Helm Right
    clearArea(40, 8, 8, 8); // Helm Front
    clearArea(48, 8, 8, 8); // Helm Left
    clearArea(56, 8, 8, 8); // Helm Back
    if (format1_8) {
        clearArea(4, 32, 4, 4); // Right Leg Layer 2 Top
        clearArea(8, 32, 4, 4); // Right Leg Layer 2 Bottom
        clearArea(0, 36, 4, 12); // Right Leg Layer 2 Right
        clearArea(4, 36, 4, 12); // Right Leg Layer 2 Front
        clearArea(8, 36, 4, 12); // Right Leg Layer 2 Left
        clearArea(12, 36, 4, 12); // Right Leg Layer 2 Back
        clearArea(20, 32, 8, 4); // Torso Layer 2 Top
        clearArea(28, 32, 8, 4); // Torso Layer 2 Bottom
        clearArea(16, 36, 4, 12); // Torso Layer 2 Right
        clearArea(20, 36, 8, 12); // Torso Layer 2 Front
        clearArea(28, 36, 4, 12); // Torso Layer 2 Left
        clearArea(32, 36, 8, 12); // Torso Layer 2 Back
        clearArea(44, 32, 4, 4); // Right Arm Layer 2 Top
        clearArea(48, 32, 4, 4); // Right Arm Layer 2 Bottom
        clearArea(40, 36, 4, 12); // Right Arm Layer 2 Right
        clearArea(44, 36, 4, 12); // Right Arm Layer 2 Front
        clearArea(48, 36, 4, 12); // Right Arm Layer 2 Left
        clearArea(52, 36, 12, 12); // Right Arm Layer 2 Back
        clearArea(4, 48, 4, 4); // Left Leg Layer 2 Top
        clearArea(8, 48, 4, 4); // Left Leg Layer 2 Bottom
        clearArea(0, 52, 4, 12); // Left Leg Layer 2 Right
        clearArea(4, 52, 4, 12); // Left Leg Layer 2 Front
        clearArea(8, 52, 4, 12); // Left Leg Layer 2 Left
        clearArea(12, 52, 4, 12); // Left Leg Layer 2 Back
        clearArea(52, 48, 4, 4); // Left Arm Layer 2 Top
        clearArea(56, 48, 4, 4); // Left Arm Layer 2 Bottom
        clearArea(48, 52, 4, 12); // Left Arm Layer 2 Right
        clearArea(52, 52, 4, 12); // Left Arm Layer 2 Front
        clearArea(56, 52, 4, 12); // Left Arm Layer 2 Left
        clearArea(60, 52, 4, 12); // Left Arm Layer 2 Back
    };

    let image = await getImg(canvas.toDataURL('image/png'));
    return image;
};

export function floodFill(canvas, ctx, startX, startY, currentColor, toner = false) {
    //get imageData
    let colorLayer = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let startPos = (startY*canvas.width + startX) * 4;

    //clicked color
    let startR = colorLayer.data[startPos]; 
    let startG = colorLayer.data[startPos+1];   
    let startB = colorLayer.data[startPos+2];
    let startA = colorLayer.data[startPos+3];
    
    //exit if color is the same
    if (currentColor.r === startR && currentColor.g === startG && currentColor.b === startB && currentColor.a === startA) {
        return;
    }
    //Start with click coords
    let pixelStack = [[startX,startY]];
    let newPos, x, y, pixelPos, reachLeft, reachRight;
    floodFill();
    function floodFill() {
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        //get current pixel position
        pixelPos = (y*canvas.width + x) * 4;
        // Go up as long as the color matches and are inside the canvas
        while(y >= 0 && matchStartColor(pixelPos)) {
            y--;
            pixelPos -= canvas.width * 4;
        }
        //Don't overextend
        pixelPos += canvas.width * 4;
        y++;
        reachLeft = false;
        reachRight = false;
        // Go down as long as the color matches and in inside the canvas
        while(y < canvas.height && matchStartColor(pixelPos)) {
            
            colorPixel(pixelPos);

            if(x > 0) {
                if(matchStartColor(pixelPos - 4)) {
                    if(!reachLeft) {
                        //Add pixel to stack
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                } else if(reachLeft) {
                    reachLeft = false;
                }
            }
        
            if(x < canvas.width-1) {
                if(matchStartColor(pixelPos + 4)) {
                    if(!reachRight) {
                        //Add pixel to stack
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                } else if(reachRight) {
                    reachRight = false;
                }
            }
            y++;        
            pixelPos += canvas.width * 4;
        }
        
        if (pixelStack.length) {
            floodFill();
            // window.setTimeout(floodFill, 100);
        }
    }

    //render floodFill result
    ctx.putImageData(colorLayer, 0, 0);

    //helpers
    function matchStartColor(pixelPos) {
        let r = colorLayer.data[pixelPos];  
        let g = colorLayer.data[pixelPos+1];    
        let b = colorLayer.data[pixelPos+2];
        let a = colorLayer.data[pixelPos+3];
        return (r === startR && g === startG && b === startB && a === startA);
    }

    function colorPixel(pixelPos) {
        let tempColor1 = colord({ r: currentColor.r, g: currentColor.g, b: currentColor.b, a: currentColor.a }).toHex();
        let tempColor2 = colorTone(tempColor1, toner);
        let tempColor3 = colord(tempColor2).toRgb();
        colorLayer.data[pixelPos] = tempColor3.r;
        colorLayer.data[pixelPos+1] = tempColor3.g;
        colorLayer.data[pixelPos+2] = tempColor3.b;
        //not ideal
        colorLayer.data[pixelPos+3] = currentColor.a;
    }
}

export function colorTone(color, toner) {
    let newColor = color;
    if (toner) {
        let tonerMode = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        switch (tonerMode) {
            case 1:
                newColor = colord(color).darken(0.04).toHex();
                break;
            case 2:
                newColor = colord(color).darken(0.02).toHex();
                break;
            case 4:
                newColor = colord(color).lighten(0.02).toHex();
                break;
            case 5:
                newColor = colord(color).lighten(0.04).toHex();
                break;
            default:
                break;
        };
    };
    return newColor;
};

export function invertColor(hex, bw = false) {
    if (hex.indexOf('#') == 0) {
        hex = hex.slice(1);
    };
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    };
    if (hex.length !== 6 || hex.length !== 8) {
        console.warn('Invalid HEX color:', hex + '.', 'Using default fallback.');
        hex = '#ffffff';
    };
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
    // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#ffffff';
    };
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
};

export function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
};