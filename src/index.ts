import { presets } from './presets';
import { createDefaultImage } from './image';
import { ParticleCanvasOptions, Particle, Origin } from './types';
import { convertToPx } from './utils';
import { updateParticle, drawParticle } from './particle';
import { createCanvas } from './canvas';
import { setupEventListeners, removeEventListeners } from './events';
import { createConfig } from './config';

export class ParticleCanvas {
  private container: HTMLElement;
  public canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private origins: Origin[] = [];
  public mouse = { x: 0, y: 0, active: false };
  public vortex = { x: 0, y: 0, active: false };
  private animationId: number | null = null;
  private img = new Image();
  private config: ParticleCanvasOptions;
  private speed = 0;
  private gravityFactor = 0;

  constructor(
    containerElement: HTMLElement,
    options: ParticleCanvasOptions = {}
  ) {
    this.container = containerElement;
    this.config = createConfig(options);
    this.init();
  }

  private init() {
    const { canvas, ctx } = createCanvas(this.config, this.container);
    this.canvas = canvas;
    this.ctx = ctx;
    setupEventListeners(this, this.canvas);
    this.loadImage();
  }

  private loadImage() {
    this.img.crossOrigin = 'Anonymous';
    this.img.onload = () => {
      this.initParticles();
      this.startAnimation();
    };
    this.img.onerror = () => {
      console.warn('Failed to load image, using default');
      this.img.src = createDefaultImage();
    };
    this.img.src = this.config.imageSrc as string;
  }

   private initParticles() {
  if (!this.canvas || !this.ctx) return;

  this.particles = [];
  this.origins = [];

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCanvas.width = this.canvas.width;
  tempCanvas.height = this.canvas.height;
  tempCtx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

  const imageData = tempCtx.getImageData(
    0,
    0,
    this.canvas.width,
    this.canvas.height
  );
  const data = imageData.data;

  const potentialOrigins: Origin[] = [];
  for (
    let y = 0;
    y < this.canvas.height;
    y += this.config.particleGap as number
  ) {
    for (
      let x = 0;
      x < this.canvas.width;
      x += this.config.particleGap as number
    ) {
      const index = (x + y * this.canvas.width) * 4;
      const alpha = data[index + 3];

      if (alpha > 0) {
        potentialOrigins.push({
          x: x,
          y: y,
          color: [data[index], data[index + 1], data[index + 2], alpha],
        });
      }
    }
  }

  let finalOrigins = potentialOrigins;
  const maxParticles = this.config.maxParticles as number;

  if (potentialOrigins.length > maxParticles) {
    // Shuffle the array to get a random sample
    for (let i = potentialOrigins.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [potentialOrigins[i], potentialOrigins[j]] = [
        potentialOrigins[j],
        potentialOrigins[i],
      ];
    }
    finalOrigins = potentialOrigins.slice(0, maxParticles);
  }
  
  this.origins = finalOrigins;
  this.particles = this.origins.map(origin => ({
    x: origin.x + (Math.random() - 0.5) * 100,
    y: origin.y + (Math.random() - 0.5) * 100,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    targetX: origin.x,
    targetY: origin.y,
    isDead: false,
  }));

  this.speed = Math.log(this.particles.length) / 10;
  this.gravityFactor = 1 - (this.config.gravity as number) * this.speed;
}

  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const origin = this.origins[i];

      if (particle.isDead) continue;

      updateParticle(
        particle,
        origin,
        this.config,
        this.mouse,
        this.vortex,
        this.speed,
        this.gravityFactor
      );
      drawParticle(particle, origin, this.ctx, this.config);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  public startAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animate();
  }

  public stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resetParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const origin = this.origins[i];
      particle.x = origin.x + (Math.random() - 0.5) * 20;
      particle.y = origin.y + (Math.random() - 0.5) * 20;
      particle.vx = 0;
      particle.vy = 0;
      particle.isDead = false;
    }
  }

  public explodeParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 5 + 2;
      particle.vx += Math.cos(angle) * force;
      particle.vy += Math.sin(angle) * force;
    }
  }

  public downloadImage(filename = 'particle-art.png') {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  public updateConfig(newOptions: Partial<ParticleCanvasOptions>) {
    this.config = { ...this.config, ...newOptions };

    if (newOptions.gravity !== undefined) {
      this.gravityFactor = 1 - (this.config.gravity as number) * this.speed;
    }

    if (newOptions.imageSrc !== undefined) {
      this.loadImage();
    }

    if (newOptions.particleGap !== undefined) {
      this.initParticles();
    }

    if (newOptions.width !== undefined || newOptions.height !== undefined) {
      if (!this.canvas) return;
      this.canvas.width = convertToPx(
        this.config.width as number,
        this.container
      );
      this.canvas.height = convertToPx(
        this.config.height as number,
        this.container
      );
      this.initParticles();
    }
  }

  public destroy() {
    this.stopAnimation();
    if (this.canvas && this.canvas.parentNode) {
      removeEventListeners(this, this.canvas);
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    this.origins = [];
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public getConfig(): ParticleCanvasOptions {
    return { ...this.config };
  }
}

export function createParticleCanvas(
  containerElement: string | HTMLElement,
  options: ParticleCanvasOptions = {}
): ParticleCanvas {
  if (!containerElement) {
    throw new Error('Container element is required');
  }

  let element: HTMLElement | null;
  if (typeof containerElement === 'string') {
    element = document.querySelector(containerElement);
    if (!element) {
      throw new Error(`Element with selector "${containerElement}" not found`);
    }
  } else {
    element = containerElement;
  }

  return new ParticleCanvas(element, options);
}

declare global {
  interface Window {
    ParticleCanvas: {
      createParticleCanvas: typeof createParticleCanvas;
      ParticleCanvas: typeof ParticleCanvas;
      presets: typeof presets;
    };
  }
}

if (typeof window !== 'undefined') {
  window.ParticleCanvas = {
    createParticleCanvas,
    ParticleCanvas,
    presets,
  };
}
