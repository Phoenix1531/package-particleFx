# Project TODO List

This document outlines potential improvements and new features for the `package-particlefx` library. Each item includes a description of what the feature is, why it would be beneficial, and a high-level guide on how to implement it.

---

## Code & Architecture Improvements

### 1. Modularize CSS Styling

*   **What**: Move inline CSS styles applied to the canvas element into a separate, injectable CSS file.
*   **Why**: This will make it easier for users to customize and override the default styles without resorting to `!important` or complex selectors. It also cleans up the JavaScript code.
*   **How**:
    1.  Create a `particle-fx.css` file in the `src` directory.
    2.  Add the necessary styles to this file (e.g., `display: block; max-width: 100%;`).
    3.  In the `createCanvas` function, instead of setting `canvas.style`, create a `<style>` tag in the document `<head>` and inject the content of the CSS file. This only needs to be done once, even if multiple canvases are created.

    ```typescript
    // src/canvas.ts
    function injectStyles() {
      if (document.getElementById('particle-fx-styles')) return;
      const style = document.createElement('style');
      style.id = 'particle-fx-styles';
      style.innerHTML = `
        .particle-fx-canvas {
          display: block;
          max-width: 100%;
          height: auto;
        }
      `;
      document.head.appendChild(style);
    }

    export function createCanvas(...) {
      injectStyles();
      const canvas = document.createElement('canvas');
      canvas.className = 'particle-fx-canvas';
      // ...
    }
    ```

### 2. State Management

*   **What**: Refactor the `ParticleCanvas` class to use a more organized state object.
*   **Why**: As more features are added, the number of properties on the `ParticleCanvas` instance will grow, making it harder to manage. A centralized state object improves readability and maintainability.
*   **How**:
    1.  In the `ParticleCanvas` class, create a `state` property.
    2.  Move properties like `particles`, `origins`, `mouse`, `vortex`, etc., into this `state` object.
    3.  Update the methods to access these properties via `this.state`.

    ```typescript
    // src/index.ts
    class ParticleCanvas {
      private state = {
        particles: [] as Particle[],
        origins: [] as Origin[],
        mouse: { x: 0, y: 0, active: false },
        vortex: { x: 0, y: 0, active: false },
        // ...
      };

      private animate = () => {
        // ...
        for (let i = 0; i < this.state.particles.length; i++) {
          // ...
        }
      };
    }
    ```

## New Features

### 1. More Particle Shapes

*   **What**: Allow for more particle shapes, including custom user-defined shapes.
*   **Why**: This will give users more creative control over the visual appearance of the particle effects.
*   **How**:
    1.  **Built-in shapes**: Add more cases to the `switch` statement in `drawParticle` for shapes like `'star'`, `'hexagon'`, etc.
    2.  **Custom shapes**:
        *   Modify the `particleShape` option to accept a function that takes the `ctx`, `x`, `y`, and `size` as arguments.
        *   In `drawParticle`, if `particleShape` is a function, call it to draw the custom shape.

    ```typescript
    // src/types.ts
    export interface ParticleCanvasOptions {
      // ...
      particleShape?: 'square' | 'circle' | 'triangle' | ((ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void);
    }

    // src/particle.ts
    export function drawParticle(...) {
      // ...
      if (typeof config.particleShape === 'function') {
        config.particleShape(ctx, x, y, size);
      } else {
        switch (config.particleShape) {
          // ...
        }
      }
    }
    ```

### 2. Particle Connections (Constellation Effect)

*   **What**: Add an option to draw lines between nearby particles.
*   **Why**: This creates a popular and visually appealing "network" or "constellation" effect.
*   **How**:
    1.  Add new options to `ParticleCanvasOptions`: `connectParticles: boolean`, `connectColor: string`, `connectDistance: number`.
    2.  In the `animate` loop, after updating all particle positions, loop through the particles again.
    3.  For each particle, loop through the subsequent particles in the array and calculate the distance between them.
    4.  If the distance is less than `connectDistance`, draw a line between them with the specified `connectColor`.

    ```typescript
    // src/index.ts - in animate()
    this.ctx.strokeStyle = this.config.connectColor || 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dist = Math.hypot(this.particles[i].x - this.particles[j].x, this.particles[i].y - this.particles[j].y);
        if (dist < (this.config.connectDistance || 100)) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    ```

### 3. React Component Wrapper

*   **What**: Create an official React component wrapper for the library.
*   **Why**: This will make it much easier and more intuitive for React developers to integrate the library into their projects.
*   **How**:
    1.  Create a new file, `src/react/index.tsx`.
    2.  In this file, create a React component that uses `useRef` for the container element and `useEffect` to initialize and destroy the `ParticleCanvas` instance.
    3.  The component should accept the `ParticleCanvasOptions` as props.
    4.  Update the build process to handle `.tsx` files and output a separate React-specific bundle.

    ```tsx
    // src/react/index.tsx
    import React, { useRef, useEffect } from 'react';
    import { createParticleCanvas, ParticleCanvas } from '../index';
    import { ParticleCanvasOptions } from '../types';

    export const ParticleCanvasComponent: React.FC<ParticleCanvasOptions> = (props) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const canvasInstance = useRef<ParticleCanvas | null>(null);

      useEffect(() => {
        if (containerRef.current) {
          canvasInstance.current = createParticleCanvas(containerRef.current, props);
        }
        return () => {
          canvasInstance.current?.destroy();
        };
      }, [props]);

      return <div ref={containerRef} style={{ width: props.width, height: props.height }} />;
    };
    ```
