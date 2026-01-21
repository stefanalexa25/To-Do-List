const authService = require("../services/auth.service");

async function login(req, res) {
  try {
    const { username, password } = req.body;
    await authService.login({ username, password }, req);
    res.json({ ok: true });} 
    catch (err) {
    res.status(err.status || 500).json({ error: err.code || "server_error" });
  }
}

async function register(req, res) {
  try {
    const { username, password } = req.body;
    await authService.register({ username, password });
    res.json({ ok: true });}
    catch (err) {
    res.status(err.status || 500).json({ error: err.code || "server_error" });
  }
}

function profile(req, res) {
  res.json(req.session.user);
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
}

module.exports = { login, register, profile, logout };
