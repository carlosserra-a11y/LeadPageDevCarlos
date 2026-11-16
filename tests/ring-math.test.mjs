import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  mod,
  ringRadius,
  angleForProgress,
  activeIndex,
  relativeAngle,
  focusFor,
  progressForIndex,
  nearestIndex,
} from '../assets/js/lib/ring-math.js';

test('clamp limita o valor ao intervalo', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(clamp(2, 0, 3), 2);
});

test('mod devolve resto positivo mesmo para números negativos', () => {
  assert.equal(mod(-1, 8), 7);
  assert.equal(mod(9, 8), 1);
  assert.equal(mod(-16, 8), 0);
});

test('ringRadius cresce com a largura do cartão e encolhe com mais cartões', () => {
  const r8 = ringRadius(400, 8);
  assert.equal(r8, Math.round(200 / Math.tan(Math.PI / 8)));
  assert.ok(ringRadius(500, 8) > r8);
  assert.ok(ringRadius(400, 12) > r8, 'mais cartões precisam de um anel maior');
});

test('ringRadius soma a folga entre cartões e é zero com menos de 3 cartões', () => {
  assert.equal(ringRadius(400, 8, 20), Math.round(220 / Math.tan(Math.PI / 8)));
  assert.equal(ringRadius(400, 2), 0);
});

test('angleForProgress vai de 0 até o último cartão sem dar a volta completa', () => {
  assert.equal(angleForProgress(0, 8), 0);
  assert.equal(angleForProgress(1, 8), -315);
  assert.equal(angleForProgress(0.5, 8), -157.5);
  assert.equal(angleForProgress(2, 8), -315, 'progresso acima de 1 é limitado');
  assert.equal(angleForProgress(-1, 8), 0, 'progresso negativo é limitado');
});

test('activeIndex encontra o cartão de frente para qualquer ângulo', () => {
  assert.equal(activeIndex(0, 8), 0);
  assert.equal(activeIndex(-45, 8), 1);
  assert.equal(activeIndex(-315, 8), 7);
  assert.equal(activeIndex(-20, 8), 0);
  assert.equal(activeIndex(-25, 8), 1);
  assert.equal(activeIndex(45, 8), 7, 'ângulo positivo volta para o fim');
  assert.equal(activeIndex(-360, 8), 0);
});

test('relativeAngle normaliza para o intervalo [-180, 180)', () => {
  assert.equal(relativeAngle(0, 0, 8), 0);
  assert.equal(relativeAngle(1, -45, 8), 0);
  assert.equal(relativeAngle(4, 0, 8), -180);
  assert.equal(relativeAngle(7, 0, 8), -45);
});

test('focusFor é 1 de frente, 0 de costas e intermediário dos lados', () => {
  assert.equal(focusFor(0, 0, 8), 1);
  assert.ok(Math.abs(focusFor(4, 0, 8)) < 1e-9);
  const side = focusFor(2, 0, 8);
  assert.ok(Math.abs(side - 0.5) < 1e-9);
});

test('progressForIndex e nearestIndex são inversos', () => {
  assert.equal(progressForIndex(0, 8), 0);
  assert.equal(progressForIndex(7, 8), 1);
  assert.equal(progressForIndex(10, 8), 1, 'índice acima do limite é limitado');
  assert.equal(progressForIndex(3, 1), 0);
  for (let i = 0; i < 8; i++) {
    assert.equal(nearestIndex(progressForIndex(i, 8), 8), i);
  }
  assert.equal(nearestIndex(0.49, 8), 3);
  assert.equal(nearestIndex(1.5, 8), 7);
});
