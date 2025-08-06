import { ParticleCanvasOptions } from './types';

export const presets: { [key: string]: ParticleCanvasOptions } = {
  fireworks: {
    particleGap: 2,
    mouseForce: 60,
    gravity: 0.1,
    noise: 20,
    clickStrength: 200,
    particleShape: 'circle',
    vortexMode: false,
  },
  snow: {
    particleGap: 6,
    mouseForce: 10,
    gravity: 0.02,
    noise: 2,
    clickStrength: 50,
    particleShape: 'circle',
    vortexMode: false,
  },
  galaxy: {
    particleGap: 3,
    mouseForce: 10,
    gravity: 0,
    noise: 5,
    clickStrength: 100,
    particleShape: 'circle',
    vortexMode: true,
  },
  rain: {
    particleGap: 8,
    mouseForce: 20,
    gravity: 0.2,
    noise: 1,
    clickStrength: 80,
    particleShape: 'triangle',
    vortexMode: false,
  },
};
