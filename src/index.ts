import { presets } from './presets';
import { createDefaultImage } from './image';
import { ParticleCanvasOptions, Particle, Origin } from './types';

class ParticleCanvas {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private origins: Origin[] = [];
  private mouse = { x: 0, y: 0, active: false };
  private vortex = { x: 0, y: 0, active: false };
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

    const presetName = options.preset;
    const presetConfig = presetName ? presets[presetName] : {};

    const defaultConfig: ParticleCanvasOptions = {
      particleGap: 4,
      mouseForce: 30,
      gravity: 0.08,
      noise: 10,
      clickStrength: 100,
      width: 400,
      height: 400,
      imageSrc: createDefaultImage(),
      hueRotation: 0,
      filter: 'none',
      particleShape: 'square',
      vortexMode: false,
    };

    this.config = { ...defaultConfig, ...presetConfig, ...options };

    this.init();
  }

  private init() {
    this.createCanvas();
    this.setupEventListeners();
    this.loadImage();
  }

  private _parseValue(value: string | number) {
    if (typeof value === 'string') {
      const match = value.match(/^(\d+)(px|vw|vh|%)$/);
      if (match) {
        return { value: parseInt(match[1]), unit: match[2] };
      }
    }
    return { value: value as number, unit: 'px' };
  }

  private _convertToPx(value: string | number) {
    const { value: parsedValue, unit } = this._parseValue(value);
    if (unit === 'vw') {
      return (parsedValue / 100) * window.innerWidth;
    } else if (unit === 'vh') {
      return (parsedValue / 100) * window.innerHeight;
    } else if (unit === '%') {
      return (parsedValue / 100) * this.container.clientWidth;
    }
    return parsedValue;
  }

  private createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this._convertToPx(this.config.width as number);
    this.canvas.height = this._convertToPx(this.config.height as number);
    this.canvas.style.display = 'block';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.height = 'auto';

    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }

  private _onMouseMove = (e: MouseEvent) => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    this.mouse.active = true;
  };

  private _onMouseLeave = () => {
    this.mouse.active = false;
    this.vortex.active = false;
  };

  private _onClick = (e: MouseEvent) => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    if (this.config.vortexMode) {
      this.vortex.x = clickX;
      this.vortex.y = clickY;
      this.vortex.active = true;
    } else {
      this.applyClickForce(clickX, clickY);
    }
  };

  private _onResize = () => {
    const width = this._parseValue(this.config.width as string);
    const height = this._parseValue(this.config.height as string);

    if (width.unit !== 'px' || height.unit !== 'px') {
      this.updateConfig({});
    }
  };

  private setupEventListeners() {
    if (!this.canvas) return;
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);
    this.canvas.addEventListener('click', this._onClick);
    window.addEventListener('resize', this._onResize);
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

    for (
      let x = 0;
      x < this.canvas.width;
      x += this.config.particleGap as number
    ) {
      for (
        let y = 0;
        y < this.canvas.height;
        y += this.config.particleGap as number
      ) {
        const index = (x + y * this.canvas.width) * 4;
        const alpha = data[index + 3];

        if (alpha > 0) {
          const origin: Origin = {
            x: x,
            y: y,
            color: [data[index], data[index + 1], data[index + 2], alpha],
          };

          const particle: Particle = {
            x: x + (Math.random() - 0.5) * 100,
            y: y + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            targetX: x,
            targetY: y,
            isDead: false,
          };

          this.origins.push(origin);
          this.particles.push(particle);
        }
      }
    }

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

      this.updateParticle(particle, origin);
      this.drawParticle(particle, origin);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  private updateParticle(particle: Particle, origin: Origin) {
    const dx =
      origin.x -
      particle.x +
      (Math.random() - 0.5) * (this.config.noise as number);
    const dy =
      origin.y -
      particle.y +
      (Math.random() - 0.5) * (this.config.noise as number);
    const distance = Math.sqrt(dx * dx + dy * dy);

    let force;
    if (distance < 5) {
      force = 0.1 * (distance / 5);
    } else {
      force = 0.02 * distance;
    }

    if (distance > 0) {
      particle.vx += (dx / distance) * force * this.speed;
      particle.vy += (dy / distance) * force * this.speed;
    }

    if (this.mouse.active) {
      if (this.config.vortexMode) {
        const vdx = particle.x - this.vortex.x;
        const vdy = particle.y - this.vortex.y;
        const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
        if (vdist > 0) {
          const angle = Math.atan2(vdy, vdx);
          const force = 1 / vdist;
          particle.vx += Math.cos(angle + Math.PI / 2) * force;
          particle.vy += Math.sin(angle + Math.PI / 2) * force;
          particle.vx -= (vdx / vdist) * force * 0.1;
          particle.vy -= (vdy / vdist) * force * 0.1;
        }
      } else {
        const mdx = particle.x - this.mouse.x;
        const mdy = particle.y - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist > 0) {
          const mforce = (this.config.mouseForce as number) / mdist;
          particle.vx += (mdx / mdist) * mforce * this.speed;
          particle.vy += (mdy / mdist) * mforce * this.speed;
        }
      }
    }

    let dampingFactor = this.gravityFactor;
    if (!this.mouse.active && distance < 10) {
      dampingFactor = Math.max(0.8, this.gravityFactor);
    }

    particle.vx *= dampingFactor;
    particle.vy *= dampingFactor;

    if (
      !this.mouse.active &&
      distance < 1 &&
      Math.abs(particle.vx) < 0.1 &&
      Math.abs(particle.vy) < 0.1
    ) {
      particle.x = origin.x;
      particle.y = origin.y;
      particle.vx = 0;
      particle.vy = 0;
    } else {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }
  }

  private drawParticle(particle: Particle, origin: Origin) {
    if (!this.ctx) return;

    const filteredColor = this.applyFilter(
      origin.color,
      this.config.filter as 'none' | 'grayscale' | 'sepia' | 'invert',
      this.config.hueRotation as number
    );
    this.ctx.fillStyle = `rgba(${filteredColor[0]}, ${filteredColor[1]}, ${filteredColor[2]}, ${filteredColor[3] / 255})`;

    const x = Math.floor(particle.x);
    const y = Math.floor(particle.y);
    const size = (this.config.particleGap as number) / 2;

    switch (this.config.particleShape) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      case 'square':
      default:
        this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
        break;
    }
  }

  private applyFilter(
    color: [number, number, number, number],
    filter: 'none' | 'grayscale' | 'sepia' | 'invert',
    hueRotation: number
  ): [number, number, number, number] {
    let r = color[0];
    let g = color[1];
    let b = color[2];
    const a = color[3];

    switch (filter) {
      case 'grayscale':
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = gray;
        break;
      case 'sepia':
        const tr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        const tg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        const tb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
        r = tr;
        g = tg;
        b = tb;
        break;
      case 'invert':
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        break;
      default:
        break;
    }

    if (hueRotation !== 0) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      h = (h * 360 + hueRotation) % 360;
      if (h < 0) h += 360;
      h /= 360;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);

      r = Math.round(r * 255);
      g = Math.round(g * 255);
      b = Math.round(b * 255);
    }

    return [r, g, b, a];
  }

  private applyClickForce(clickX: number, clickY: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const dx = particle.x - clickX;
      const dy = particle.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const force = (this.config.clickStrength as number) / (distance + 1);
        particle.vx += (dx / distance) * force * 0.1;
        particle.vy += (dy / distance) * force * 0.1;
      }
    }
  }

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
      this.canvas.width = this._convertToPx(this.config.width as number);
      this.canvas.height = this._convertToPx(this.config.height as number);
      this.initParticles();
    }
  }

  public destroy() {
    this.stopAnimation();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
      this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
      this.canvas.removeEventListener('click', this._onClick);
      window.removeEventListener('resize', this.onresize);
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    this.origins = [];
  }

  public getParticleCount(): number {
    return this.particles.length;
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

if (typeof window !== 'undefined') {
  window.ParticleCanvas = {
    createParticleCanvas,
    ParticleCanvas,
    presets,
  };
}
