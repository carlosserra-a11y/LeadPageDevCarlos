import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_KEY, isValidGaId, readConsent, shouldLoadAnalytics } from '../assets/js/lib/analytics.js';

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
};

test('isValidGaId aceita só IDs do Google Analytics 4 (G-XXXX)', () => {
  assert.ok(isValidGaId('G-ABC123XYZ9'));
  assert.ok(!isValidGaId(''));
  assert.ok(!isValidGaId('UA-12345-1'));
  assert.ok(!isValidGaId('G-<script>'));
  assert.ok(!isValidGaId(undefined));
});

test('readConsent devolve a escolha salva ou null', () => {
  assert.equal(readConsent(memoryStorage({ [CONSENT_KEY]: 'granted' })), 'granted');
  assert.equal(readConsent(memoryStorage({ [CONSENT_KEY]: 'denied' })), 'denied');
  assert.equal(readConsent(memoryStorage({ [CONSENT_KEY]: 'qualquer' })), null);
  assert.equal(readConsent(memoryStorage()), null);
  assert.equal(readConsent(null), null);
  const broken = {
    getItem: () => {
      throw new Error('bloqueado');
    },
  };
  assert.equal(readConsent(broken), null);
});

test('shouldLoadAnalytics só carrega com ID válido e consentimento', () => {
  assert.equal(shouldLoadAnalytics('G-ABC123', 'granted'), true);
  assert.equal(shouldLoadAnalytics('G-ABC123', 'denied'), false);
  assert.equal(shouldLoadAnalytics('G-ABC123', null), false);
  assert.equal(shouldLoadAnalytics('', 'granted'), false);
});
