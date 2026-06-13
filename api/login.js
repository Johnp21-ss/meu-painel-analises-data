// api/login.js — substitui o arquivo atual na Vercel
// Lê usuários do Google Sheets via Apps Script (dinâmico, sem hardcode)
import jwt from "jsonwebtoken";

const JWT_SECRET = "SEGREDO_SUPER_FORTE";

// Cole aqui a URL do seu Apps Script (a mesma do BI)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLis6Vs8Z3oqlt2BXkBpSqcSAdw1orEJvk2VotHJ_WuZRXQ5Qe8UnIKgKySCjKVz26/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    // Busca lista de usuários direto do Sheets via Apps Script
    const resp = await fetch(`${APPS_SCRIPT_URL}?acao=listarUsuarios`);
    const data = await resp.json();

    if (!data.ok || !data.usuarios) {
      console.error("Erro ao carregar usuários:", data);
      return res.status(500).json({ error: "Erro ao carregar usuários" });
    }

    // Valida login: usuario, senha e conta ativa
    const user = data.usuarios.find(
      u => u.usuario === usuario &&
           u.senha === senha &&
           u.ativo !== "false"
    );

    if (!user) {
      return res.status(401).json({ error: "Login inválido" });
    }

    // Gera token com os mesmos campos de antes (compatível com o BI)
    const token = jwt.sign(
      {
        usuario: user.usuario,
        nivel:   user.nivel,
        nome:    user.nome || user.usuario
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({ token });

  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
