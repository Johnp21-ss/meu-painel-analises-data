// api/escala-rt.js
// Retorna CSV da aba Escala_RT via Apps Script
import jwt from "jsonwebtoken";

const JWT_SECRET      = "SEGREDO_SUPER_FORTE";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLis6Vs8Z3oqlt2BXkBpSqcSAdw1orEJvk2VotHJ_WuZRXQ5Qe8UnIKgKySCjKVz26/exec";

export default async function handler(req, res) {
  // Validar JWT
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Sem token" });

  const token = auth.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?acao=escalaRT`, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Apps Script retornou ${response.status}` });
    }

    const csv = await response.text();

    // Verifica se retornou HTML de erro (Apps Script às vezes redireciona para login)
    if (csv.trim().startsWith("<!DOCTYPE") || csv.trim().startsWith("<html")) {
      return res.status(502).json({ error: "Apps Script retornou HTML — verifique publicação" });
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(csv);

  } catch (err) {
    console.error("Erro escala-rt:", err);
    return res.status(500).json({ error: "Erro interno: " + err.message });
  }
}
