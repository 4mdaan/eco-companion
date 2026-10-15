// app/models/Admin.js — consultas usadas pelo painel administrativo.

const db = require("../../config/database");

function state() {
  return db._getState();
}

const Admin = {
  // todos os pedidos, do mais recente para o mais antigo, com o nome do comprador
  listarPedidos() {
    const usuarios = state().usuarios;
    return state()
      .pedidos.slice()
      .sort((a, b) => {
        const data = (b.criado_em || "").localeCompare(a.criado_em || "");
        return data !== 0 ? data : Number(b.id) - Number(a.id);
      })
      .map((p) => {
        const dono = usuarios.find((u) => Number(u.id) === Number(p.usuario_id));
        let itens = [];
        try {
          itens = JSON.parse(p.itens_json || "[]");
        } catch (e) {}
        return {
          ...p,
          comprador: dono ? dono.nome : "Usuário removido",
          email: dono ? dono.email : "",
          itens,
        };
      });
  },

  // todos os usuários (sem expor o hash da senha)
  listarUsuarios() {
    return state()
      .usuarios.slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((u) => ({
        id: Number(u.id),
        nome: u.nome,
        email: u.email,
        cidade: u.cidade || "",
        admin: u.admin === true || u.admin === 1,
        criado_em: u.criado_em,
      }));
  },

  // números para o topo do painel
  estatisticas() {
    const pedidos = state().pedidos;
    const receita = pedidos.reduce((soma, p) => soma + Number(p.total || 0), 0);
    return {
      totalUsuarios: state().usuarios.length,
      totalPedidos: pedidos.length,
      receita,
    };
  },
};

module.exports = Admin;
