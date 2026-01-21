const prisma = require("../prisma");

async function login({ username, password }, req) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || user.password !== password) {
    const e = new Error("invalid");
    e.status = 401;
    e.code = "invalid";
    throw e;
  }

  req.session.user = { name: username };
}

async function register({ username, password }) {
  const existing = await prisma.user.findUnique({ where: { username } });

  if (existing) {
    const e = new Error("username_taken");
    e.status = 400;
    e.code = "username_taken";
    throw e;
  }

  await prisma.user.create({ data: { username, password } });
}

module.exports = { login, register };
