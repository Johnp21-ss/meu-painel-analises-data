import jwt from "jsonwebtoken";

const usuarios = [
  { usuario: "john_petter", senha: "admin123", nivel: "ADMIN" },
  { usuario: "gestor_pi", senha: "gestor123", nivel: "GESTOR" },
  { usuario: "monitor_ana", senha: "monitor123", nivel: "MONITOR" },
  { usuario: "fiscal_maria", senha: "fiscal123", nivel: "FISCAL" }
];

export default function handler(req, res) {
  const { usuario, senha } = req.body;

  const user = usuarios.find(
    u => u.usuario === usuario && u.senha === senha
  );

  if (!user) {
    return res.status(401).json({ error: "Login inválido" });
  }

  const token = jwt.sign(
    {
      usuario: user.usuario,
      nivel: user.nivel
    },
    "SEGREDO_SUPER_FORTE",
    { expiresIn: "2h" }
  );

  res.status(200).json({ token });
}
