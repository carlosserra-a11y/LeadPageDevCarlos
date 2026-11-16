/**
 * Divide o texto de um elemento em palavras (<span class="word">), mantendo
 * elementos internos como <em>. Com `mask`, cada palavra ganha um
 * <span class="word__inner"> para animar "subindo" por trás de uma máscara.
 * Idempotente: chamar duas vezes não divide de novo.
 * @param {HTMLElement} el
 * @param {{ mask?: boolean }} [options]
 * @returns {NodeListOf<HTMLElement>} os elementos a animar
 */
export function splitWords(el, { mask = true } = {}) {
  const selector = mask ? '.word__inner' : '.word';
  if (el.dataset.splitDone === 'true') return el.querySelectorAll(selector);

  const makeWord = (text) => {
    const word = document.createElement('span');
    word.className = 'word';
    if (mask) {
      const inner = document.createElement('span');
      inner.className = 'word__inner';
      inner.textContent = text;
      word.append(inner);
    } else {
      word.textContent = text;
    }
    return word;
  };

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          fragment.append(/^\s+$/.test(part) ? document.createTextNode(' ') : makeWord(part));
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };

  walk(el);
  el.dataset.splitDone = 'true';
  return el.querySelectorAll(selector);
}
