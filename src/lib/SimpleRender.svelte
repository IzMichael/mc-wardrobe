<script>
    import { onMount } from 'svelte';
    let canvas;
    export let skin = '';
    onMount(() => {
        build(skin);
    });

    function build(imgData) {
        if (!imgData) return false;

        var settings = {
            outer: true
        };

        if (!settings.scale) {
            settings.scale = 10;
        }
        if (!settings.draw) {
            settings.draw = 'model';
        }

        var scratchCanv = document.createElement('canvas'),
            model = canvas.getContext('2d'),
            scratch = scratchCanv.getContext('2d'),
            skinimg = new Image(),
            heightMultiplier = settings.draw === 'head' ? 17.6 : 44.8;

        // document.body.appendChild(scratchCanv);

        scratchCanv.setAttribute('width', 64 * settings.scale);
        scratchCanv.setAttribute('height', 64 * settings.scale);

        canvas.setAttribute('width', 20 * settings.scale);
        canvas.setAttribute('height', heightMultiplier * settings.scale);

        skinimg.onload = function () {
            scratch.drawImage(skinimg, 0, 0, 64, 64, 0, 0, 64, 64);

            // Scale it
            scaleImage(scratch.getImageData(0, 0, 64, 64), scratch, 0, 0, settings.scale);

            // Draw the skinimg
            if (settings.draw === 'model') {
                drawModel(model, scratchCanv, scratch, settings.outer, settings.scale);
            } else {
                drawHead(model, scratchCanv, scratch, settings.outer, settings.scale);
            }
        };

        skinimg.src = imgData;
    }

    function drawModel(model, scratchCanv, scratch, showOuter, scale) {
        var scaleEight = 8 * scale;

        // Left Leg
        // Left Leg - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.scale(-1, 1);
        model.drawImage(scratchCanv, 4 * scale, 20 * scale, 4 * scale, 12 * scale, -16 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale);

        // Right Leg
        // Right Leg - Right
        model.setTransform(1, 0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 26.4 / 1.2 * scale, 4 * scale, 12 * scale);

        // Right Leg - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 8 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale);

        // Arm Left
        // Arm Left - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.scale(-1, 1);
        model.drawImage(scratchCanv, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -20 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale);

        // Arm Left - Top
        model.setTransform(-1, 0.5, 1, 0.5, 0, 0);
        model.drawImage(scratchCanv, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 0, 16 * scale, 4 * scale, 4 * scale);

        // Body
        // Body - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 20 * scale, 20 * scale, 8 * scale, 12 * scale, 8 * scale, 20 / 1.2 * scale, scaleEight, 12 * scale);

        // Arm Right
        // Arm Right - Right
        model.setTransform(1, 0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 40 * scale, 20 * scale, 4 * scale, 12 * scale, 0, 16 / 1.2 * scale, 4 * scale, 12 * scale);

        // Arm Right - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale);

        // Arm Right - Top
        model.setTransform(-1, 0.5, 1, 0.5, 0, 0);
        model.scale(-1, 1);
        model.drawImage(scratchCanv, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -16 * scale, 16 * scale, 4 * scale, 4 * scale);

        if (showOuter) {
            // Left Leg
            // Left Leg - Front
            model.setTransform(1, -0.5, 0, 1.2, 0, 0);
            model.scale(-1, 1);
            model.drawImage(scratchCanv, 4 * scale, 36 * scale, 4 * scale, 12 * scale, -16 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale);

            // Right Leg
            // Right Leg - Right
            model.setTransform(1, 0.5, 0, 1.2, 0, 0);
            model.drawImage(scratchCanv, 0 * scale, 36 * scale, 4 * scale, 12 * scale, 4 * scale, 26.4 / 1.2 * scale, 4 * scale, 12 * scale);

            // Right Leg - Front
            model.setTransform(1, -0.5, 0, 1.2, 0, 0);
            model.drawImage(scratchCanv, 4 * scale, 36 * scale, 4 * scale, 12 * scale, 8 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale);

            // Arm Left
            // Arm Left - Front
            model.setTransform(1, -0.5, 0, 1.2, 0, 0);
            model.scale(-1, 1);
            model.drawImage(scratchCanv, 44 * scale, 36 * scale, 4 * scale, 12 * scale, -20 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale);

            // Arm Left - Top
            model.setTransform(-1, 0.5, 1, 0.5, 0, 0);
            model.drawImage(scratchCanv, 44 * scale, 32 * scale, 4 * scale, 4 * scale, 0, 16 * scale, 4 * scale, 4 * scale);

            // Body
            // Body - Front
            model.setTransform(1, -0.5, 0, 1.2, 0, 0);
            model.drawImage(scratchCanv, 20 * scale, 36 * scale, 8 * scale, 12 * scale, 8 * scale, 20 / 1.2 * scale, scaleEight, 12 * scale);

            // Arm Right
            // Arm Right - Right
            model.setTransform(1, 0.5, 0, 1.2, 0, 0);
            model.drawImage(scratchCanv, 40 * scale, 36 * scale, 4 * scale, 12 * scale, 0, 16 / 1.2 * scale, 4 * scale, 12 * scale);

            // Arm Right - Front
            model.setTransform(1, -0.5, 0, 1.2, 0, 0);
            model.drawImage(scratchCanv, 44 * scale, 36 * scale, 4 * scale, 12 * scale, 4 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale);

            // Arm Right - Top
            model.setTransform(-1, 0.5, 1, 0.5, 0, 0);
            model.scale(-1, 1);
            model.drawImage(scratchCanv, 44 * scale, 32 * scale, 4 * scale, 4 * scale, -16 * scale, 16 * scale, 4 * scale, 4 * scale);
        };

        drawHead(model, scratchCanv, scratch, showOuter, scale);
    }

    function drawHead(model, scratchCanv, scratch, showOuter, scale) {
        var scaleEight = 8 * scale;
        // Head - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, scaleEight, scaleEight, scaleEight, scaleEight, 10 * scale, 13 / 1.2 * scale, scaleEight, scaleEight);

        // Head - Right
        model.setTransform(1, 0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 0, scaleEight, scaleEight, scaleEight, 2 * scale, 3 / 1.2 * scale, scaleEight, scaleEight);

        // Head - Top
        model.setTransform(-1, 0.5, 1, 0.5, 0, 0);
        model.scale(-1, 1);
        model.drawImage(scratchCanv, scaleEight, 0, scaleEight, scaleEight, -3 * scale, 5 * scale, scaleEight, scaleEight);

        if (!showOuter) return;

        // Outer - Front
        model.setTransform(1, -0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 40 * scale, scaleEight, scaleEight, scaleEight, 10 * scale, 13 / 1.2 * scale, scaleEight, scaleEight);

        // Outer - Right
        model.setTransform(1, 0.5, 0, 1.2, 0, 0);
        model.drawImage(scratchCanv, 32 * scale, scaleEight, scaleEight, scaleEight, 2 * scale, 3 / 1.2 * scale, scaleEight, scaleEight);

        // Outer - Top
        model.setTransform(-1, 0.5, 1, 0.5, 0, 0);
        model.scale(-1, 1);
        model.drawImage(scratchCanv, 40 * scale, 0, scaleEight, scaleEight, -3 * scale, 5 * scale, scaleEight, scaleEight);
    }

    function scaleImage(imageData, context, dx, dy, scale) {
        var width = imageData.width,
            height = imageData.height;

        context.clearRect(0, 0, width, height); //Clear the spot where it originated from

        for (var y = 0; y < height; y++) { // Height original
            for (var x = 0; x < width; x++) { // Width original
                // Gets original colour, then makes a scaled square of the same colour
                var index = (x + y * width) * 4,
                    fill = imageData.data[index];

                fill += ',' + imageData.data[index + 1] + ',' + imageData.data[index + 2] + ',' + imageData.data[index + 3];

                context.fillStyle = 'rgba(' + fill + ')';
                context.fillRect(dx + x * scale, dy + y * scale, scale, scale);
            }
        }
    }
</script>

<div class="flex-1 aspect-[20/44.8]">
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
</div>

<style>
    
</style>