// api/historico_frota.js
// Retorna JSON do histórico de frota via Apps Script
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
    // Repassa filtros opcionais para o Apps Script
    const params = new URLSearchParams();
    params.append("acao", "historico_frota");
    if (req.query.placa)    params.append("placa",    req.query.placa);
    if (req.query.divisao)  params.append("divisao",  req.query.divisao);
    if (req.query.situacao) params.append("situacao", req.query.situacao);
    if (req.query.delta)    params.append("delta",    req.query.delta);

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Apps Script retornou ${response.status}` });
    }

    const text = await response.text();
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      return res.status(502).json({ error: "Apps Script retornou HTML — verifique publicação" });
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Resposta inválida do Apps Script" });
    }

    if (!json.ok) {
      return res.status(500).json({ error: json.msg || "Erro no Apps Script" });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(json);

  } catch (err) {
    console.error("Erro historico_frota:", err);
    return res.status(500).json({ error: "Erro interno: " + err.message });
  }
}
