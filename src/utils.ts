export function parseValue(value: string | number) {
  if (typeof value === 'string') {
    const match = value.match(/^(\d+)(px|vw|vh|%)$/);
    if (match) {
      return { value: parseInt(match[1]), unit: match[2] };
    }
  }
  return { value: value as number, unit: 'px' };
}

export function convertToPx(value: string | number, container: HTMLElement) {
  const { value: parsedValue, unit } = parseValue(value);
  if (unit === 'vw') {
    return (parsedValue / 100) * window.innerWidth;
  } else if (unit === 'vh') {
    return (parsedValue / 100) * window.innerHeight;
  } else if (unit === '%') {
    return (parsedValue / 100) * container.clientWidth;
  }
  return parsedValue;
}
