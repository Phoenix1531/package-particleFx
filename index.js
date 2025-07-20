
class ParticleCanvas {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.origins = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.vortex = { x: 0, y: 0, active: false };
        this.animationId = null;
        this.img = new Image();

        // Default configuration
        const defaultConfig = {
            particleGap: 4,
            mouseForce: 30,
            gravity: 0.08,
            noise: 10,
            clickStrength: 100,
            width: 400,
            height: 400,
            imageSrc: this.createDefaultImage(),
            hueRotation: 0,
            filter: 'none',
            particleShape: 'square',
            vortexMode: false,
        };

        this.config = { ...defaultConfig, ...options };

        this.init();
    }

    createDefaultImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY2NmZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzMzNjYztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDk5O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgCiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CiAgCiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iI2ZmNjY2NiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iIzY2ZmY2NiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSI2MCIgZmlsbD0iI2ZmZmY2NiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMzAwIiByPSI0MCIgZmlsbD0iI2ZmNjZmZiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAwIiBjeT0iMzAwIiByPSI0MCIgZmlsbD0iIzY2ZmZmZiIgb3BhY2l0eT0iMC44Ci8+CiAgCiAgPHRleHQgeD0iMjAwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UEFSVElDTEU8L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVGRkVDVDwvdGV4dD4KPC9zdmc+Cg==';
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.loadImage();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.canvas.style.display = 'block';
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';

        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
    }

    setupEventListeners() {
        this._onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.mouse.active = true;
        };
        this.canvas.addEventListener('mousemove', this._onMouseMove);

        this._onMouseOut = () => {
            this.mouse.active = false;
            this.vortex.active = false;
        };
        this.canvas.addEventListener('mouseout', this._onMouseOut);

        this._onClick = (e) => {
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
        this.canvas.addEventListener('click', this._onClick);
    }

    loadImage() {
        this.img.crossOrigin = "Anonymous";
        this.img.onload = () => {
            this.initParticles();
            this.startAnimation();
        };
        this.img.onerror = () => {
            console.warn('Failed to load image, using default');
            this.img.src = this.createDefaultImage();
        };
        this.img.src = this.config.imageSrc;
    }

    initParticles() {
        this.particles = [];
        this.origins = [];

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;

        tempCtx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

        const imageData = tempCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let x = 0; x < this.canvas.width; x += this.config.particleGap) {
            for (let y = 0; y < this.canvas.height; y += this.config.particleGap) {
                const index = (x + y * this.canvas.width) * 4;
                const alpha = data[index + 3];

                if (alpha > 0) {
                    const origin = {
                        x: x,
                        y: y,
                        color: [data[index], data[index + 1], data[index + 2], alpha]
                    };

                    const particle = {
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
        this.gravityFactor = 1 - this.config.gravity * this.speed;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const origin = this.origins[i];

            if (particle.isDead) continue;

            this.updateParticle(particle, origin);
            this.drawParticle(particle, origin);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticle(particle, origin) {
        const dx = origin.x - particle.x + (Math.random() - 0.5) * this.config.noise;
        const dy = origin.y - particle.y + (Math.random() - 0.5) * this.config.noise;
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
                    const mforce = this.config.mouseForce / mdist;
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

        if (!this.mouse.active && distance < 1 && Math.abs(particle.vx) < 0.1 && Math.abs(particle.vy) < 0.1) {
            particle.x = origin.x;
            particle.y = origin.y;
            particle.vx = 0;
            particle.vy = 0;
        } else {
            particle.x += particle.vx;
            particle.y += particle.vy;
        }
    }

    drawParticle(particle, origin) {
        const filteredColor = this.applyFilter(origin.color, this.config.filter, this.config.hueRotation);
        this.ctx.fillStyle = `rgba(${filteredColor[0]}, ${filteredColor[1]}, ${filteredColor[2]}, ${filteredColor[3] / 255})`;

        const x = Math.floor(particle.x);
        const y = Math.floor(particle.y);
        const size = this.config.particleGap / 2;

        switch (this.config.particleShape) {
            case "circle":
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case "triangle":
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - size);
                this.ctx.lineTo(x + size, y + size);
                this.ctx.lineTo(x - size, y + size);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case "square":
            default:
                this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
                break;
        }
    }

    applyFilter(color, filter, hueRotation) {
        let [r, g, b, a] = color;

        switch (filter) {
            case "grayscale":
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = gray;
                break;
            case "sepia":
                const tr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
                const tg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
                const tb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
                r = tr;
                g = tg;
                b = tb;
                break;
            case "invert":
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
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
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

            const hue2rgb = (p, q, t) => {
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

    applyClickForce(clickX, clickY) {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const dx = particle.x - clickX;
            const dy = particle.y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const force = this.config.clickStrength / (distance + 1);
                particle.vx += (dx / distance) * force * 0.1;
                particle.vy += (dy / distance) * force * 0.1;
            }
        }
    }

    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resetParticles() {
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

    explodeParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 5 + 2;
            particle.vx += Math.cos(angle) * force;
            particle.vy += Math.sin(angle) * force;
        }
    }

    downloadImage(filename = 'particle-art.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    updateConfig(newOptions) {
        this.config = { ...this.config, ...newOptions };

        if (newOptions.gravity !== undefined) {
            this.gravityFactor = 1 - this.config.gravity * this.speed;
        }

        if (newOptions.imageSrc !== undefined) {
            this.loadImage();
        }

        if (newOptions.particleGap !== undefined) {
            this.initParticles();
        }

        if (newOptions.width !== undefined || newOptions.height !== undefined) {
            this.canvas.width = this.config.width;
            this.canvas.height = this.config.height;
            this.initParticles();
        }
    }

    destroy() {
        this.stopAnimation();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.removeEventListener('mousemove', this._onMouseMove);
            this.canvas.removeEventListener('mouseout', this._onMouseOut);
            this.canvas.removeEventListener('click', this._onClick);
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.particles = [];
        this.origins = [];
    }

    getParticleCount() {
        return this.particles.length;
    }

    getConfig() {
        return { ...this.config };
    }
}

export function createParticleCanvas(containerElement, options = {}) {
    if (!containerElement) {
        throw new Error('Container element is required');
    }

    if (typeof containerElement === 'string') {
        const element = document.querySelector(containerElement);
        if (!element) {
            throw new Error(`Element with selector "${containerElement}" not found`);
        }
        containerElement = element;
    }

    return new ParticleCanvas(containerElement, options);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createParticleCanvas, ParticleCanvas };
} else if (typeof define === 'function' && define.amd) {
    define([], function () {
        return { createParticleCanvas, ParticleCanvas };
    });
} else if (typeof window !== 'undefined') {
    window.ParticleCanvas = { createParticleCanvas, ParticleCanvas };
}