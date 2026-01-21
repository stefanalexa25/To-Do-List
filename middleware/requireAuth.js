function requireAuth(req, res, next) {
  if (!req.session?.user)  // '?' din req.session?.user face sa nu crape serverul daca nu e initializata sesiunea
    return res.status(401).json({ error: "invalid" });
  else next();
}
module.exports = requireAuth;