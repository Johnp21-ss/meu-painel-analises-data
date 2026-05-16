import jwt from "jsonwebtoken";

export default async function handler(req, res) {

  const auth = req.headers.authorization;

  if (!auth) return res.status(401).send("Sem token");

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SEGREDO_SUPER_FORTE");

    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-PWDRlSYT4cY9rOK7Dz1R2Fe0HzoXFbu4icqnPk5M6eGOBUngZFwkhI-9TXPpT9d-wvWCzXNVxteq/pub?gid=498256387&single=true&output=csv");

    const csv = await response.text();

    return res.status(200).send(csv);

  } catch {
    return res.status(401).send("Token inválido");
  }
}
