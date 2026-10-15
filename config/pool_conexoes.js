// config/pool_conexoes.js — pool de conexões com o MySQL.
//
// Um "pool" mantém várias conexões abertas e as reaproveita entre as
// requisições, em vez de abrir e fechar uma conexão a cada consulta.
// Isso deixa o sistema mais rápido e controla quantas conexões ficam
// abertas ao mesmo tempo (connectionLimit).
//
// As credenciais vêm do arquivo .env (veja o .env.example).
// O banco é criado pelo script_bd.sql.
//
// Exemplo de uso em um model:
//   const pool = require("../../config/pool_conexoes");
//   const [linhas] = await pool.query("SELECT * FROM pacotes WHERE id = ?", [id]);

require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "eco_companion",
  charset: "utf8mb4",
  waitForConnections: true, // se todas estiverem ocupadas, a requisição espera
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
  queueLimit: 0, // fila de espera sem limite
});

// Testa se o banco responde. Retorna true/false e registra o motivo no console.
async function testarConexao() {
  try {
    const conexao = await pool.getConnection();
    await conexao.ping();
    conexao.release(); // devolve a conexão ao pool
    console.log("Conexão com o banco de dados OK.");
    return true;
  } catch (erro) {
    console.error("Falha ao conectar no banco de dados:", erro.message);
    return false;
  }
}

pool.testarConexao = testarConexao;

module.exports = pool;
