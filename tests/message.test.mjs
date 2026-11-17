import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIMITS,
  clean,
  normalizePhone,
  isValidEmail,
  validateContact,
  buildMessage,
  whatsappUrl,
  mailtoUrl,
  safeHttpUrl,
} from '../assets/js/lib/message.js';

const business = {
  perfil: 'negocio',
  nome: 'Ana',
  negocio: 'Pizzaria da Ana',
  projeto: 'Cardápio com pedido no WhatsApp',
  mensagem: 'Quero um site com cardápio e entrega por bairro.',
};

const recruiter = {
  perfil: 'recrutador',
  nome: 'Bruno',
  empresa: 'Empresa X',
  vaga: 'Dev Full Stack Júnior',
  mensagem: 'Gostaria de conversar sobre uma vaga no nosso time.',
};

test('clean remove caracteres de controle, espaços repetidos e corta no limite', () => {
  assert.equal(clean('  Olá\u0000   mundo  ', 50), 'Olá mundo');
  assert.equal(clean('a\n\n\n\nb', 50), 'a\n\nb');
  assert.equal(clean('abcdef', 3), 'abc');
  assert.equal(clean(undefined, 10), '');
  assert.equal(clean(null, 10), '');
});

test('normalizePhone aceita números brasileiros e adiciona o 55', () => {
  assert.equal(normalizePhone('(48) 99999-0000'), '5548999990000');
  assert.equal(normalizePhone('+55 48 99999-0000'), '5548999990000');
  assert.equal(normalizePhone('48 3333-0000'), '554833330000');
  assert.equal(normalizePhone('123'), '');
  assert.equal(normalizePhone(''), '');
  assert.equal(normalizePhone(undefined), '');
});

test('isValidEmail aceita e-mails comuns e recusa os quebrados', () => {
  assert.ok(isValidEmail('carlos@exemplo.com'));
  assert.ok(isValidEmail('a.b+c@sub.dominio.com.br'));
  assert.ok(!isValidEmail('carlos@'));
  assert.ok(!isValidEmail('carlos exemplo.com'));
  assert.ok(!isValidEmail('a@b.c\nBcc: x@y.com'));
  assert.ok(!isValidEmail(''));
});

test('validateContact exige nome e o que o negócio precisa', () => {
  assert.deepEqual(validateContact(business), { ok: true, errors: {} });
  const result = validateContact({ perfil: 'negocio', nome: 'A', mensagem: 'curta' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.nome);
  assert.ok(result.errors.servicos);
});

test('validateContact do recrutador exige nome e mensagem com tamanho mínimo', () => {
  assert.deepEqual(validateContact(recruiter), { ok: true, errors: {} });
  const result = validateContact({ perfil: 'recrutador', nome: 'B', mensagem: 'curta' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.nome);
  assert.ok(result.errors.mensagem);
});

test('validateContact recusa perfil desconhecido', () => {
  const result = validateContact({ ...business, perfil: 'hacker' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.perfil);
});

test('buildMessage monta o texto do dono de negócio', () => {
  const text = buildMessage(business);
  assert.match(text, /^Olá, Carlos! Vim pelo seu site/);
  assert.match(text, /\*Nome:\* Ana/);
  assert.match(text, /\*Negócio:\* Pizzaria da Ana/);
  assert.match(text, /\*Projeto:\* Cardápio com pedido no WhatsApp/);
  assert.match(text, /entrega por bairro/);
  assert.doesNotMatch(text, /Empresa/);
});

test('buildMessage monta o texto do recrutador e omite campos vazios', () => {
  const text = buildMessage({ ...recruiter, vaga: '' });
  assert.match(text, /vaga/i);
  assert.match(text, /\*Empresa:\* Empresa X/);
  assert.doesNotMatch(text, /\*Vaga:\*/);
});

test('buildMessage respeita os limites de tamanho', () => {
  const text = buildMessage({ ...business, mensagem: 'x'.repeat(5000) });
  assert.ok(text.length < LIMITS.mensagem + 400);
});

test('whatsappUrl codifica o texto e exige telefone válido', () => {
  const url = whatsappUrl('(48) 99999-0000', 'Olá & tchau #1');
  assert.equal(url, 'https://wa.me/5548999990000?text=Ol%C3%A1%20%26%20tchau%20%231');
  assert.equal(whatsappUrl('', 'oi'), '');
});

test('mailtoUrl codifica assunto e corpo e exige e-mail válido', () => {
  const url = mailtoUrl('carlos@exemplo.com', 'Assunto & teste', 'Linha 1\nLinha 2');
  assert.equal(url, 'mailto:carlos@exemplo.com?subject=Assunto%20%26%20teste&body=Linha%201%0ALinha%202');
  assert.equal(mailtoUrl('invalido', 'a', 'b'), '');
});

test('safeHttpUrl só aceita endereços https/http', () => {
  assert.equal(safeHttpUrl('https://linkedin.com/in/carlos'), 'https://linkedin.com/in/carlos');
  assert.equal(safeHttpUrl('javascript:alert(1)'), '');
  assert.equal(safeHttpUrl('not a url'), '');
  assert.equal(safeHttpUrl(''), '');
});
