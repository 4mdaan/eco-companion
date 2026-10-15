// scripts/tornar-admin.js — promove um usuário a administrador.
//
// Uso:  node scripts/tornar-admin.js email@do-usuario.com
//
// Executa uma vez, no terminal, para dar acesso ao painel /admin.

const db = require("../config/database");

const email = (process.argv[2] || "").toLowerCase().trim();

if (!email) {
  console.log("Informe o e-mail. Ex.: node scripts/tornar-admin.js maria@email.com");
  process.exit(1);
}

const state = db._getState();
const user = state.usuarios.find((u) => u.email === email);

if (!user) {
  console.log(`Nenhum usuário com o e-mail "${email}". Cadastre-se primeiro no site.`);
  process.exit(1);
}

user.admin = true;
db._save();

console.log(`✓ "${user.nome}" (${email}) agora é administrador. Acesse /admin.`);
