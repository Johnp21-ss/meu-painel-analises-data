export default async function handler(req, res) {

  const token = req.headers.authorization;

  if (token !== "Bearer SEGREDO_123") {
    return res.status(401).send("Não autorizado");
  }

  try {
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-PWDRlSYT4cY9rOK7Dz1R2Fe0HzoXFbu4icqnPk5M6eGOBUngZFwkhI-9TXPpT9d-wvWCzXNVxteq/pub?gid=498256387&single=true&output=csv");
    const csv = await response.text();

    res.status(200).send(csv);

  } catch (error) {
    res.status(500).send("Erro ao buscar dados");
  }
}
