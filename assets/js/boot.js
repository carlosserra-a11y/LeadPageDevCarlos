/*
 * Roda no <head>, antes de pintar a página (script clássico, sem módulo).
 * Marca se há JavaScript e se o visitante prefere menos movimento, e liga o
 * pré-carregador com uma trava de segurança: o conteúdo nunca fica preso.
 */
(function () {
  var root = document.documentElement;
  var reduced = false;

  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    reduced = false;
  }

  root.classList.remove('no-js');
  root.classList.add('js');
  root.classList.add(reduced ? 'reduced-motion' : 'is-loading');

  window.setTimeout(function () {
    root.classList.remove('is-loading');
  }, 4000);
})();
