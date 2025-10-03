import { ParticleCanvasOptions } from './types';
import { presets } from './presets';
import { createDefaultImage } from './image';

export function createConfig(
  options: ParticleCanvasOptions
): ParticleCanvasOptions {
  const presetName = options.preset;
  // This is the line to change
  const presetConfig: Partial<ParticleCanvasOptions> = presetName
    ? presets[presetName]
    : {};

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
   maxParticles: 30000, 
  };

  return { ...defaultConfig, ...presetConfig, ...options };
}