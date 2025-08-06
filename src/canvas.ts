import { ParticleCanvasOptions } from './types';
import { convertToPx } from './utils';

export function createCanvas(
  config: ParticleCanvasOptions,
  container: HTMLElement
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = convertToPx(config.width as number, container);
  canvas.height = convertToPx(config.height as number, container);
  canvas.style.display = 'block';
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  container.appendChild(canvas);

  return { canvas, ctx };
}
