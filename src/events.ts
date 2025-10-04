import { ParticleCanvas } from './index';
import { parseValue, debounce } from './utils';
import { applyClickForce } from './particle';

const eventHandlers = new WeakMap<
  ParticleCanvas,
  {
    mousemove: (e: MouseEvent) => void;
    mouseleave: () => void;
    click: (e: MouseEvent) => void;
    resize: () => void;
  }
>();

export function setupEventListeners(
  instance: ParticleCanvas,
  canvas: HTMLCanvasElement
) {
  const handlers = {
    mousemove: (e: MouseEvent) => onMouseMove(e, instance),
    mouseleave: () => onMouseLeave(instance),
    click: (e: MouseEvent) => onClick(e, instance),
    resize: debounce(() => onResize(instance), 300),
  };

  eventHandlers.set(instance, handlers);

  canvas.addEventListener('mousemove', handlers.mousemove);
  canvas.addEventListener('mouseleave', handlers.mouseleave);
  canvas.addEventListener('click', handlers.click);
  window.addEventListener('resize', handlers.resize);
}

export function removeEventListeners(
  instance: ParticleCanvas,
  canvas: HTMLCanvasElement
) {
  const handlers = eventHandlers.get(instance);
  if (!handlers) return;

  canvas.removeEventListener('mousemove', handlers.mousemove);
  canvas.removeEventListener('mouseleave', handlers.mouseleave);
  canvas.removeEventListener('click', handlers.click);
  window.removeEventListener('resize', handlers.resize);

  eventHandlers.delete(instance);
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