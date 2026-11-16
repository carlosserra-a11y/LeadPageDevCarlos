// Matemática do anel 3D de projetos. Funções puras, sem DOM (testadas em tests/).

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Resto sempre positivo: mod(-1, 8) === 7. */
export function mod(value, size) {
  return ((value % size) + size) % size;
}

/**
 * Distância do centro do anel até cada cartão, para que cartões vizinhos
 * se encostem (mais a folga `gap` de cada lado).
 */
export function ringRadius(cardWidth, count, gap = 0) {
  if (count < 3) return 0;
  return Math.round((cardWidth / 2 + gap) / Math.tan(Math.PI / count));
}

/** Ângulo do anel para um progresso de rolagem de 0 a 1 (do 1º ao último cartão). */
export function angleForProgress(progress, count) {
  const step = 360 / count;
  const angle = -clamp(progress, 0, 1) * (count - 1) * step;
  return angle === 0 ? 0 : angle;
}

/** Índice do cartão que está de frente para a câmera. */
export function activeIndex(angle, count) {
  const step = 360 / count;
  return mod(Math.round(-angle / step), count);
}

/** Ângulo do cartão em relação à câmera, normalizado para [-180, 180). */
export function relativeAngle(index, angle, count) {
  const step = 360 / count;
  return mod(index * step + angle + 180, 360) - 180;
}

/** 1 quando o cartão está de frente, 0 quando está de costas. */
export function focusFor(index, angle, count) {
  const radians = (relativeAngle(index, angle, count) * Math.PI) / 180;
  return (Math.cos(radians) + 1) / 2;
}

/** Progresso de rolagem (0 a 1) que deixa o cartão `index` de frente. */
export function progressForIndex(index, count) {
  if (count < 2) return 0;
  return clamp(index, 0, count - 1) / (count - 1);
}

/** Cartão mais próximo para um progresso de rolagem. */
export function nearestIndex(progress, count) {
  if (count < 2) return 0;
  return clamp(Math.round(clamp(progress, 0, 1) * (count - 1)), 0, count - 1);
}
