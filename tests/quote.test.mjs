import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, cleanList, validateStep, validateContact, buildMessage } from '../assets/js/lib/message.js';

const quote = {
  perfil: 'negocio',
  nome: 'Ana',
  negocio: 'Pizzaria da Ana',
  segmento: 'Restaurante ou delivery',
  cidade: 'Palhoça/SC',
  link: '@pizzariadaana',
  servicos: ['Cardápio com pedido no WhatsApp', 'Atendente com IA'],
  recursos: ['Pedido no WhatsApp', 'Painel para editar sozinho'],
  prazo: 'Em até 1 mês',
  material: ['Logo', 'Fotos'],
  mensagem: 'Quero receber pedidos com taxa por bairro.',
};

test('cleanList limpa cada item, remove vazios e repetidos e limita a quantidade', () => {
  assert.deepEqual(cleanList(['  Logo ', '', 'Logo', 'Fotos\u0000'], 20, 10), ['Logo', 'Fotos']);
  assert.deepEqual(cleanList('Fotos', 20, 10), ['Fotos']);
  assert.deepEqual(cleanList(undefined, 20, 10), []);
  assert.deepEqual(cleanList(['a', 'b', 'c'], 20, 2), ['a', 'b']);
  assert.deepEqual(cleanList(['abcdef'], 3, 5), ['abc']);
});

test('validateStep confere cada etapa do orçamento', () => {
  assert.equal(validateStep('servicos', { servicos: [] }).ok, false);
  assert.ok(validateStep('servicos', { servicos: [] }).errors.servicos);
  assert.equal(validateStep('servicos', { servicos: ['Atendente com IA'] }).ok, true);
  assert.equal(validateStep('negocio', { nome: '' }).ok, false);
  assert.ok(validateStep('negocio', { nome: 'A' }).errors.nome);
  assert.equal(validateStep('negocio', { nome: 'Ana' }).ok, true);
  assert.equal(validateStep('detalhes', {}).ok, true);
  assert.equal(validateStep('revisao', quote).ok, true);
});

test('validateContact aceita o orçamento sem mensagem livre', () => {
  assert.deepEqual(validateContact({ ...quote, mensagem: '' }), { ok: true, errors: {} });
});

test('buildMessage monta o orçamento completo e organizado', () => {
  const text = buildMessage(quote);
  assert.match(text, /^Olá, Carlos! Vim pelo seu site e quero um orçamento\./);
  assert.match(text, /\*Nome:\* Ana/);
  assert.match(text, /\*Negócio:\* Pizzaria da Ana/);
  assert.match(text, /\*Segmento:\* Restaurante ou delivery/);
  assert.match(text, /\*Cidade:\* Palhoça\/SC/);
  assert.match(text, /\*Site ou Instagram:\* @pizzariadaana/);
  assert.match(text, /\*Preciso de:\* Cardápio com pedido no WhatsApp, Atendente com IA/);
  assert.match(text, /\*Recursos:\* Pedido no WhatsApp, Painel para editar sozinho/);
  assert.match(text, /\*Prazo:\* Em até 1 mês/);
  assert.match(text, /\*Já tenho:\* Logo, Fotos/);
  assert.match(text, /\*Sobre o projeto:\*\nQuero receber pedidos/);
});

test('buildMessage omite o que não foi preenchido', () => {
  const text = buildMessage({ perfil: 'negocio', nome: 'Ana', servicos: ['Portfólio'] });
  assert.match(text, /\*Preciso de:\* Portfólio/);
  assert.doesNotMatch(text, /Segmento|Cidade|Recursos|Prazo|Já tenho|Sobre o projeto|undefined/);
});

test('buildMessage limita listas e textos longos', () => {
  const many = Array.from({ length: 40 }, (_, i) => `Item ${i}`);
  const text = buildMessage({ ...quote, recursos: many, link: 'x'.repeat(900), mensagem: 'y'.repeat(5000) });
  assert.ok(text.length < LIMITS.mensagem + 1500);
  assert.doesNotMatch(text, /Item 20/);
});

test('buildMessage informa o pacote escolhido nos "Quero este"', () => {
  const text = buildMessage({ ...quote, pacote: 'Profissional' });
  assert.match(text, /\*Pacote:\* Profissional/);
  assert.doesNotMatch(buildMessage(quote), /Pacote/);
});
