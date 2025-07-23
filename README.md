# package-particlefx

A lightweight, framework-agnostic JavaScript library that renders interactive particle-based image hover effects using canvas. Customize particle behavior with extensive options for physics, visual effects, and user interaction. Easily integrate into React, Vue, or plain HTML projects by passing a DOM container element.

## Features

-  **Image-to-Particles**: Convert any image into animated particles
-  **Dynamic Interactions**: Particles respond to mouse hover, clicks, and even a vortex mode
-  **Visual Customization**: Apply color filters (grayscale, sepia, invert), hue rotation, and choose particle shapes (square, circle, triangle)
-  **Framework Agnostic**: Works seamlessly with React, Vue, Angular, or vanilla JS
-  **Highly Configurable**: Fine-tune particle behavior, forces, and appearance
-  **Responsive**: Automatically adapts to container size
-  **Image Download**: Save the current canvas state as a PNG image
-  **TypeScript Support**: Full type definitions included
-  **Lightweight**: Zero dependencies, pure JavaScript

## Installation

```bash
npm install package-particlefx
```

## Quick Start

### Vanilla JavaScript
```javascript
import { createParticleCanvas } from 'package-particlefx';

const container = document.getElementById('my-container');
const particleCanvas = createParticleCanvas(container, {
  imageSrc: 'path/to/your/image.jpg',
  width: 600,
  height: 400,
  particleGap: 3,
  mouseForce: 50,
  filter: 'sepia', // New: Apply a sepia filter
  particleShape: 'circle', // New: Use circular particles
});

// Control the animation
particleCanvas.explodeParticles();
particleCanvas.resetParticles();
particleCanvas.downloadImage('my-particle-art.png'); // New: Download the canvas
```

### React
```jsx
import React, { useRef, useEffect, useState } from 'react';
import { createParticleCanvas } from 'package-particlefx';

function ParticleComponent() {
  const containerRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const [config, setConfig] = useState({
    imageSrc: '/my-image.png',
    particleGap: 4,
    mouseForce: 30,
    hueRotation: 180, // New: Rotate hue by 180 degrees
    vortexMode: true, // New: Enable vortex interaction
  });

  useEffect(() => {
    if (containerRef.current) {
      particleCanvasRef.current = createParticleCanvas(containerRef.current, config);
    }

    return () => {
      particleCanvasRef.current?.destroy();
    };
  }, [config]); // Re-initialize when config changes

  const handleExplode = () => {
    particleCanvasRef.current?.explodeParticles();
  };

  const handleReset = () => {
    particleCanvasRef.current?.resetParticles();
  };

  const handleDownload = () => {
    particleCanvasRef.current?.downloadImage();
  };

  return (
    <div>
      <div ref={containerRef} style={{ width: '500px', height: '300px' }} />
      <button onClick={handleExplode}>Explode</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleDownload}>Download</button>
      {/* Example of dynamically updating config */}
      <button onClick={() => setConfig(prev => ({ ...prev, vortexMode: !prev.vortexMode }))}>
        Toggle Vortex Mode
      </button>
    </div>
  );
}

export default ParticleComponent;
```

### Vue 3
```vue
<template>
  <div>
    <div ref="container" style="width: 500px; height: 300px;"></div>
    <button @click="explode">Explode</button>
    <button @click="reset">Reset</button>
    <button @click="download">Download</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createParticleCanvas } from 'package-particlefx';

const container = ref(null);
let particleCanvas = null;

onMounted(() => {
  particleCanvas = createParticleCanvas(container.value, {
    imageSrc: '/my-image.png',
    width: 500,
    height: 300,
    filter: 'invert', // New: Invert colors
  });
});

onUnmounted(() => {
  particleCanvas?.destroy();
});

const explode = () => particleCanvas?.explodeParticles();
const reset = () => particleCanvas?.resetParticles();
const download = () => particleCanvas?.downloadImage(); // New: Download image
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `imageSrc` | string | Built-in gradient | Path or data URL of the image to convert |
| `width` | number | 400 | Canvas width in pixels |
| `height` | number | 400 | Canvas height in pixels |
| `particleGap` | number | 4 | Spacing between particles (lower = more particles) |
| `mouseForce` | number | 30 | Strength of mouse repulsion effect |
| `gravity` | number | 0.08 | Force pulling particles back to origin |
| `noise` | number | 10 | Random movement applied to particles |
| `clickStrength` | number | 100 | Force applied when clicking on canvas |
| `hueRotation` | number | 0 | Rotates the hue of particle colors (0-360 degrees) |
| `filter` | 'none' \| 'grayscale' \| 'sepia' \| 'invert' | 'none' | Applies a color filter to particles |
| `particleShape` | 'square' \| 'circle' \| 'triangle' | 'square' | Shape of individual particles |
| `vortexMode` | boolean | false | If true, clicks create a vortex effect instead of a ripple |

## API Reference

### createParticleCanvas(container, options)

Creates a new particle canvas instance.

**Parameters:**
- `container` (Element|string): DOM element or CSS selector
- `options` (Object): Configuration options

**Returns:** ParticleCanvas instance

### ParticleCanvas Methods

#### `resetParticles()`
Resets all particles to their original positions with minimal random offset.

#### `explodeParticles()`
Applies random outward forces to all particles, creating an explosion effect.

#### `updateConfig(newOptions)`
Updates configuration options dynamically. Only changed options need to be provided.

```javascript
particleCanvas.updateConfig({
  mouseForce: 80,
  gravity: 0.12,
  particleGap: 2,
  filter: 'grayscale'
});
```

#### `downloadImage(filename?: string)`
Downloads the current canvas content as a PNG image.

**Parameters:**
- `filename` (string, optional): The name of the file to download (default: `particle-art.png`)

#### `destroy()`
Stops animation and removes the canvas from DOM. Call this for cleanup.

#### `getParticleCount()`
Returns the current number of particles.

#### `getConfig()`
Returns a copy of the current configuration.

#### `stopAnimation()` / `startAnimation()`
Controls the animation loop manually.

## Performance Tips

- **Particle Gap**: Higher values (4-8) create fewer particles and better performance
- **Image Size**: Smaller images process faster during initialization
- **Canvas Size**: Larger canvases require more computational power
- **Mobile**: Consider reducing particle count on mobile devices

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT © Anmol Singh

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.