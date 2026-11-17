// Regras do Google Analytics com consentimento (LGPD). Funções puras, sem DOM.

/** Chave onde a escolha do visitante fica guardada no navegador. */
export const CONSENT_KEY = 'cs-consent';
const CHOICES = ['granted', 'denied'];

/**
 * ID de medição do Google Analytics 4 (formato G-XXXXXXX).
 * @param {unknown} id
 * @returns {boolean}
 */
export function isValidGaId(id) {
  return /^G-[A-Z0-9]{4,20}$/.test(String(id ?? ''));
}

/**
 * Escolha salva ("granted" ou "denied"), ou null se não houver ou o
 * armazenamento estiver bloqueado.
 * @param {{ getItem: (key: string) => string | null } | null | undefined} storage
 * @returns {'granted' | 'denied' | null}
 */
export function readConsent(storage) {
  try {
    const value = storage?.getItem(CONSENT_KEY) ?? null;
    return CHOICES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * O Analytics só carrega com um ID válido e o "aceito" do visitante.
 * @param {unknown} id
 * @param {string | null} choice
 * @returns {boolean}
 */
export function shouldLoadAnalytics(id, choice) {
  return isValidGaId(id) && choice === 'granted';
}
