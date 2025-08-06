import { ParticleCanvas } from './index';
import { parseValue } from './utils';
import { applyClickForce } from './particle';

export function setupEventListeners(
  instance: ParticleCanvas,
  canvas: HTMLCanvasElement
) {
  canvas.addEventListener('mousemove', (e) => onMouseMove(e, instance));
  canvas.addEventListener('mouseleave', () => onMouseLeave(instance));
  canvas.addEventListener('click', (e) => onClick(e, instance));
  window.addEventListener('resize', () => onResize(instance));
}

export function removeEventListeners(
  instance: ParticleCanvas,
  canvas: HTMLCanvasElement
) {
  canvas.removeEventListener('mousemove', (e) => onMouseMove(e, instance));
  canvas.removeEventListener('mouseleave', () => onMouseLeave(instance));
  canvas.removeEventListener('click', (e) => onClick(e, instance));
  window.removeEventListener('resize', () => onResize(instance));
}

function onMouseMove(e: MouseEvent, instance: ParticleCanvas) {
  if (!instance.canvas) return;
  const rect = instance.canvas.getBoundingClientRect();
  instance.mouse.x =
    (e.clientX - rect.left) * (instance.canvas.width / rect.width);
  instance.mouse.y =
    (e.clientY - rect.top) * (instance.canvas.height / rect.height);
  instance.mouse.active = true;
}

function onMouseLeave(instance: ParticleCanvas) {
  instance.mouse.active = false;
  instance.vortex.active = false;
}

function onClick(e: MouseEvent, instance: ParticleCanvas) {
  if (!instance.canvas) return;
  const rect = instance.canvas.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (instance.canvas.width / rect.width);
  const clickY =
    (e.clientY - rect.top) * (instance.canvas.height / rect.height);

  if (instance.getConfig().vortexMode) {
    instance.vortex.x = clickX;
    instance.vortex.y = clickY;
    instance.vortex.active = true;
  } else {
    applyClickForce(
      instance.getParticles(),
      clickX,
      clickY,
      instance.getConfig()
    );
  }
}

function onResize(instance: ParticleCanvas) {
  const config = instance.getConfig();
  const width = parseValue(config.width as string);
  const height = parseValue(config.height as string);

  if (width.unit !== 'px' || height.unit !== 'px') {
    instance.updateConfig({});
  }
}
