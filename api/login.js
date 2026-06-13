// api/login.js — Versão corrigida com tratamento de redirecionamento
import jwt from "jsonwebtoken";

const JWT_SECRET = "SEGREDO_SUPER_FORTE";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLis6Vs8Z3oqlt2BXkBpSqcSAdw1orEJvk2VotHJ_WuZRXQ5Qe8UnIKgKySCjKVz26/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    // CORREÇÃO: Adicionado redirect: "follow" para acompanhar o redirecionamento do Google Scripts
    const resp = await fetch(`${APPS_SCRIPT_URL}?acao=listarUsuarios`, {
      method: "GET",
      redirect: "follow"
    });

    if (!resp.ok) {
      console.error("Erro na comunicação com o Google:", resp.statusText);
      return res.status(500).json({ error: "Erro de comunicação com banco de dados" });
    }

    const data = await resp.json();

    if (!data.ok || !data.usuarios) {
      console.error("Erro ao carregar usuários da planilha:", data);
      return res.status(500).json({ error: "Erro ao carregar lista de usuários" });
    }

    // Valida login: usuario, senha e conta ativa (ignorando maiúsculas/minúsculas no nome de usuário)
    const user = data.usuarios.find(
      u => u.usuario.toLowerCase() === usuario.toLowerCase() &&
           u.senha === senha &&
           u.ativo !== "false"
    );

    if (!user) {
      return res.status(401).json({ error: "Login ou senha inválidos" });
    }

    // Gera token compatível com o seu BI
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
    console.error("Erro interno no login backend:", err);
    return res.status(500).json({ error: "Erro interno no servidor de login" });
  }
}
