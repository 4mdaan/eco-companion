// config/database.js — armazenamento em JSON, sem dependências nativas.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "eco-companion-data.json");
const INITIAL_STATE = {
  usuarios: [],
  itens_salvos: [],
  carrinho: [],
  pedidos: [],
  pacotes: [],
};

// pacotes originais (usados só na primeira vez, para popular o banco)
const PACOTES_INICIAIS = require("../app/models/pacotesData");

function readState() {
  if (!fs.existsSync(DB_PATH)) {
    const inicial = JSON.parse(JSON.stringify(INITIAL_STATE));
    inicial.pacotes = JSON.parse(JSON.stringify(PACOTES_INICIAIS));
    fs.writeFileSync(DB_PATH, JSON.stringify(inicial, null, 2));
    return inicial;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    // se o banco ainda não tem pacotes, popula com os iniciais (migração)
    let pacotes = Array.isArray(parsed.pacotes) ? parsed.pacotes : [];
    if (pacotes.length === 0) {
      pacotes = JSON.parse(JSON.stringify(PACOTES_INICIAIS));
    }
    const estado = {
      usuarios: Array.isArray(parsed.usuarios) ? parsed.usuarios : [],
      itens_salvos: Array.isArray(parsed.itens_salvos) ? parsed.itens_salvos : [],
      carrinho: Array.isArray(parsed.carrinho) ? parsed.carrinho : [],
      pedidos: Array.isArray(parsed.pedidos) ? parsed.pedidos : [],
      pacotes,
    };
    return estado;
  } catch (error) {
    // O banco está corrompido (JSON inválido). Antes de recriar,
    // guardamos uma cópia do arquivo problemático para não perder os
    // dados de vez — o desenvolvedor pode tentar recuperá-los depois.
    console.error("Banco de dados corrompido:", error.message);
    try {
      const backup = DB_PATH + ".corrompido-" + Date.now() + ".bak";
      fs.copyFileSync(DB_PATH, backup);
      console.error("Cópia do banco corrompido salva em:", backup);
    } catch (e) {
      console.error("Não foi possível salvar o backup:", e.message);
    }
    const inicial = JSON.parse(JSON.stringify(INITIAL_STATE));
    inicial.pacotes = JSON.parse(JSON.stringify(PACOTES_INICIAIS));
    fs.writeFileSync(DB_PATH, JSON.stringify(inicial, null, 2));
    return inicial;
  }
}

function saveState(state) {
  try {
    // Escrita atômica: grava num arquivo temporário e depois renomeia.
    // Renomear é uma operação instantânea, então o banco nunca fica
    // "pela metade" caso o programa seja encerrado no meio da escrita.
    const tmp = DB_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, DB_PATH);
    return true;
  } catch (error) {
    // não derruba a aplicação se a escrita falhar (disco cheio, permissão);
    // registra no console para o desenvolvedor investigar
    console.error("Erro ao salvar o banco de dados:", error.message);
    return false;
  }
}

let state = readState();

function now() {
  return new Date().toISOString();
}

function normalizeEmail(value) {
  return String(value || "").toLowerCase().trim();
}

function normalizeUser(user) {
  return {
    ...user,
    id: Number(user.id),
    pontos: Number(user.pontos) || 0,
    cashback: Number(user.cashback) || 0,
    admin: user.admin === true || user.admin === 1,
  };
}

function normalizeItem(item) {
  return {
    ...item,
    id: Number(item.id),
    usuario_id: Number(item.usuario_id),
    preco: Number(item.preco) || 0,
  };
}

class Query {
  constructor(query) {
    this.query = query.trim();
  }

  get(...params) {
    return executeSelect(this.query, params, true);
  }

  all(...params) {
    return executeSelect(this.query, params, false);
  }

  run(...params) {
    return executeMutation(this.query, params);
  }
}

function executeSelect(query, params, single) {
  const sql = query.toLowerCase();

  if (sql.startsWith("select * from usuarios where id =")) {
    const user = state.usuarios.find((item) => item.id === Number(params[0]));
    return user ? normalizeUser(user) : undefined;
  }

  if (sql.startsWith("select * from usuarios where email =")) {
    const user = state.usuarios.find((item) => item.email === normalizeEmail(params[0]));
    return user ? normalizeUser(user) : undefined;
  }

  if (sql.startsWith("select * from usuarios")) {
    return state.usuarios.map(normalizeUser);
  }

  if (sql.startsWith("select * from itens_salvos where usuario_id =")) {
    const items = state.itens_salvos
      .filter((item) => item.usuario_id === Number(params[0]) && item.tipo === params[1])
      .sort((a, b) => (b.criado_em || "").localeCompare(a.criado_em || ""));
    return items.map(normalizeItem);
  }

  if (sql.startsWith("select id from itens_salvos where usuario_id =")) {
    const item = state.itens_salvos.find(
      (entry) => entry.usuario_id === Number(params[0]) && entry.tipo === params[1] && entry.ref_id === params[2]
    );
    return item ? { id: Number(item.id) } : undefined;
  }

  if (sql.startsWith("select * from itens_salvos where id =")) {
    const item = state.itens_salvos.find(
      (entry) => entry.id === Number(params[0]) && entry.usuario_id === Number(params[1])
    );
    return item ? normalizeItem(item) : undefined;
  }

  if (single) {
    return undefined;
  }
  return [];
}

function executeMutation(query, params) {
  const sql = query.toLowerCase();

  if (sql.startsWith("insert into usuarios")) {
    const nextId = state.usuarios.reduce((max, user) => Math.max(max, Number(user.id || 0)), 0) + 1;
    const user = {
      id: nextId,
      nome: params[0],
      email: normalizeEmail(params[1]),
      senha_hash: params[2],
      cidade: "",
      estilo: "praia",
      pontos: 0,
      cashback: 0,
      criado_em: now(),
    };
    state.usuarios.push(user);
    saveState(state);
    return { lastInsertRowid: user.id, changes: 1 };
  }

  if (sql.startsWith("insert into itens_salvos")) {
    const nextId = state.itens_salvos.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
    const item = {
      id: nextId,
      usuario_id: Number(params[0]),
      tipo: params[1],
      ref_id: params[2],
      nome: params[3],
      meta: params[4],
      preco: Number(params[5]) || 0,
      criado_em: now(),
    };
    state.itens_salvos.push(item);
    saveState(state);
    return { lastInsertRowid: item.id, changes: 1 };
  }

  if (sql.startsWith("update usuarios set nome =")) {
    const user = state.usuarios.find((entry) => entry.id === Number(params[3]));
    if (user) {
      user.nome = params[0];
      user.cidade = params[1];
      user.estilo = params[2];
      saveState(state);
    }
    return { changes: user ? 1 : 0 };
  }

  if (sql.startsWith("update usuarios set pontos =")) {
    const user = state.usuarios.find((entry) => entry.id === Number(params[2]));
    if (user) {
      user.pontos = Math.max(0, Number(user.pontos) + Number(params[0]));
      user.cashback = Math.max(0, Number(user.cashback) + Number(params[1]));
      saveState(state);
    }
    return { changes: user ? 1 : 0 };
  }

  if (sql.startsWith("update usuarios set cashback = 0")) {
    const user = state.usuarios.find((entry) => entry.id === Number(params[0]));
    if (user) {
      user.cashback = 0;
      saveState(state);
    }
    return { changes: user ? 1 : 0 };
  }

  if (sql.startsWith("delete from itens_salvos where id =")) {
    const before = state.itens_salvos.length;
    state.itens_salvos = state.itens_salvos.filter((entry) => entry.id !== Number(params[0]));
    saveState(state);
    return { changes: before - state.itens_salvos.length };
  }

  return { changes: 0 };
}

const db = {
  prepare(query) {
    return new Query(query);
  },
  exec() {
    return true;
  },
  pragma() {
    return true;
  },
  _getState() {
    return state;
  },
  _save() {
    saveState(state);
  },
};

module.exports = db;
