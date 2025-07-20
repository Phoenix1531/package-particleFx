
declare module 'package-particlefx' {
  /**
   * Options for configuring the particle canvas.
   */
  export interface ParticleCanvasOptions {
    particleGap?: number;
    mouseForce?: number;
    gravity?: number;
    noise?: number;
    clickStrength?: number;
    width?: number;
    height?: number;
    imageSrc?: string;
    hueRotation?: number;
    filter?: 'none' | 'grayscale' | 'sepia' | 'invert';
    particleShape?: 'square' | 'circle' | 'triangle';
    vortexMode?: boolean;
  }

  /**
   * Represents the main particle canvas controller.
   */
  export class ParticleCanvas {
    constructor(containerElement: HTMLElement, options?: ParticleCanvasOptions);

    /** Resets particles to their original positions. */
    resetParticles(): void;

    /** Applies an explosive force to all particles. */
    explodeParticles(): void;

    /** Updates the canvas configuration with new options. */
    updateConfig(newOptions: Partial<ParticleCanvasOptions>): void;

    /** Downloads the current canvas state as a PNG image. */
    downloadImage(filename?: string): void;

    /** Stops the animation and removes the canvas from the DOM. */
    destroy(): void;

    /** Returns the current number of active particles. */
    getParticleCount(): number;

    /** Returns the current configuration object. */
    getConfig(): ParticleCanvasOptions;
  }

  /**
   * Factory function to create and initialize a particle canvas instance.
   * @param containerElement The HTML element or a CSS selector string for the container.
   * @param options Configuration options for the particle canvas.
   * @returns A new instance of ParticleCanvas.
   */
  export function createParticleCanvas(
    containerElement: string | HTMLElement,
    options?: ParticleCanvasOptions
  ): ParticleCanvas;
}
