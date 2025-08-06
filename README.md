# package-particlefx

A lightweight, framework-agnostic JavaScript/TypeScript library that renders interactive particle-based image hover effects using `<canvas>`. Customize particle behavior with extensive options for physics, visual effects, and user interaction. Easily integrate into React, Vue, or plain HTML projects by passing a DOM container element.

---

## 🚀 What's New in 2.0.2

### ✨ Features

- **🔧 New Project Structure**
  - Fully rewritten in **TypeScript** for better type safety and developer experience.
  - Codebase reorganized into modular components within `src/`:
    - Canvas creation
    - Particle logic
    - Event handling
    - Configuration

- **⚡ Modern Build System**
  - Switched to **Vite** for blazing-fast builds.
  - Supports both `ES` and `UMD` bundles.
  - Introduced `vite.config.ts`.

- **🧼 Code Quality Improvements**
  - ESLint and Prettier integrated for a consistent and clean code style.
  - Added `.eslintrc.js` and `.prettierrc.json`.

- **📦 Updated Dependencies**
  - Development dependencies now include TypeScript, ESLint, Prettier, and Vite.

### ⚠️ Breaking Changes

- The **main entry point** of the package has changed. Refer to the updated `package.json` for paths.
- Internal APIs have been **refactored** for modularity — usage patterns may require updates.

---

## Features

- **Image-to-Particles**: Convert any image into animated particles
- **Dynamic Interactions**: Particles respond to mouse hover, clicks, and vortex mode
- **Visual Customization**: Filters (grayscale, sepia, invert), hue rotation, shapes
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JS
- **Highly Configurable**: Tune physics, appearance, and behavior
- **Responsive**: Adapts to container size
- **Image Download**: Export canvas as PNG
- **TypeScript Support**: Full types included
- **Lightweight**: Zero dependencies, pure JS/TS

---

## Installation

```bash
npm install package-particlefx
```

---

## Quick Start

### Vanilla JavaScript

```javascript
import { createParticleCanvas } from 'package-particlefx';

const container = document.getElementById('my-container');
const particleCanvas = createParticleCanvas(container, {
  preset: 'fireworks',
  width: '100vw',
  height: '100vh',
});

particleCanvas.explodeParticles();
particleCanvas.resetParticles();
particleCanvas.downloadImage('my-particle-art.png');
```

### React

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { createParticleCanvas } from 'package-particlefx';

function ParticleComponent() {
  const containerRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const [config, setConfig] = useState({
    preset: 'galaxy',
    width: '100%',
    height: '400px',
  });

  useEffect(() => {
    if (containerRef.current) {
      particleCanvasRef.current = createParticleCanvas(containerRef.current, config);
    }

    return () => {
      particleCanvasRef.current?.destroy();
    };
  }, [config]);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
      <button onClick={() => particleCanvasRef.current?.explodeParticles()}>Explode</button>
      <button onClick={() => particleCanvasRef.current?.resetParticles()}>Reset</button>
      <button onClick={() => particleCanvasRef.current?.downloadImage()}>Download</button>
      <button onClick={() => setConfig(prev => ({ ...prev, preset: 'snow' }))}>Change to Snow</button>
    </div>
  );
}

export default ParticleComponent;
```

---

## Configuration Options

| Option          | Type                                         | Default           | Description                                                       |
| --------------- | -------------------------------------------- | ----------------- | ----------------------------------------------------------------- |
| `preset`        | 'fireworks' \| 'snow' \| 'galaxy' \| 'rain'  | `undefined`       | Applies a pre-configured set of options.                          |
| `imageSrc`      | string                                       | Built-in gradient | Path or data URL of the image to convert.                         |
| `width`         | number \| string                             | 400               | Canvas width in pixels or a string with units (e.g., `'100vw'`).  |
| `height`        | number \| string                             | 400               | Canvas height in pixels or a string with units (e.g., `'100vh'`). |
| `particleGap`   | number                                       | 4                 | Spacing between particles (lower = more particles).               |
| `mouseForce`    | number                                       | 30                | Strength of mouse repulsion effect.                               |
| `gravity`       | number                                       | 0.08              | Force pulling particles back to origin.                           |
| `noise`         | number                                       | 10                | Random movement applied to particles.                             |
| `clickStrength` | number                                       | 100               | Force applied when clicking on canvas.                            |
| `hueRotation`   | number                                       | 0                 | Rotates the hue of particle colors (0-360 degrees).               |
| `filter`        | 'none' \| 'grayscale' \| 'sepia' \| 'invert' | 'none'            | Applies a color filter to particles.                              |
| `particleShape` | 'square' \| 'circle' \| 'triangle'           | 'square'          | Shape of individual particles.                                    |
| `vortexMode`    | boolean                                      | false             | If true, clicks create a vortex effect instead of a ripple.       |

---

## API Reference

### createParticleCanvas(container, options)

Creates a new particle canvas instance.

**Returns:** ParticleCanvas instance

### ParticleCanvas Methods

- `resetParticles()`
- `explodeParticles()`
- `updateConfig(newOptions)`
- `downloadImage(filename?: string)`
- `destroy()`
- `getParticleCount()`
- `getConfig()`
- `stopAnimation()` / `startAnimation()`

---

## Performance Tips

- Use higher `particleGap` (4-8) for better performance.
- Smaller images = faster loading.
- Avoid full-screen canvas on mobile for performance.

---

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

---

## License

MIT © Anmol Singh

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.