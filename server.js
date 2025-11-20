const express = require("express");
const app = express();
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(
  session({
    secret: "whatever-secret-string",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "server ok" });
});

app.post("/api/echo", (req, res) => {
  res.json(req.body);
});

app.post("/api/login", async(req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({  where: { username }});
  if (!user) {return res.status(401).json({ error: "invalid" });}
  if (user.password !== password) {return res.status(401).json({ error: "invalid" });}
  req.session.user = { name: username };
  res.json({ ok: true });
});

app.get("/api/profile", requireAuth, (req, res) => {
  res.json(req.session.user);
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "invalid" });
  } else {
    next();
  }
}

app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.post("/api/register", async(req, res) =>{
  const { username, password } = req.body;
  const existing = await prisma.user.findUnique({where: { username }});
  if(existing){
    return res.status(400).json({ error: "username_taken" });
  }
  else{
  await prisma.user.create({  data: { username, password }});
  res.json({ ok: true });
  }
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
