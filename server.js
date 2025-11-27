const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.use(
  session({
    secret: "fastidious",
    resave: false,
    saveUninitialized: false,
  })
);

//First commit

app.get("/api/test", (req, res) => {
  res.json({ message: "server ok" });
});

app.post("/api/echo", (req, res) => {
  res.json(req.body);
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "invalid" });
  if (user.password !== password)
    return res.status(401).json({ error: "invalid" });
  req.session.user = { name: username };
  res.json({ ok: true });
});

app.get("/api/profile", requireAuth, (req, res) => {
  res.json(req.session.user);
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "invalid" });
  else next();
}

app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(400).json({ error: "username_taken" });
  else {
    await prisma.user.create({ data: { username, password } });
    res.json({ ok: true });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

//Second commit

//CRUD List
app.post("/api/lists", requireAuth, async (req, res) => {
  const { name } = req.body;
  const sessionUser = req.session.user;
  const user = await prisma.user.findUnique({
    where: { username: sessionUser.name },
  });
  const list = await prisma.list.create({
    data: { name, ownerId: user.id },
  });
  res.json(list);
});

app.get("/api/lists", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.session.user.name },
    include: { lists: true, collabLists: true },
  });
  res.json({
    owned: user.lists,
    collaborating: user.collabLists,
  });
});

app.post("/api/lists/:listId/collaborators", requireAuth, async (req, res) => {
  const { username } = req.body;
  const user = await prisma.user.findUnique({
    where: { username: req.session.user.name },
  });
  const listId = Number(req.params.listId);
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) return res.status(404).json({ error: "list_not_found" });
  if (list.ownerId !== user.id)
    return res.status(403).json({ error: "forbidden" });
  const collaborator = await prisma.user.findUnique({ where: { username } });
  if (!collaborator) return res.status(404).json({ error: "user_not_found" });
  await prisma.list.update({
    where: { id: listId },
    data: {
      collaborators: {
        connect: { id: collaborator.id },
      },
    },
  });
  res.json({ ok: true });
});

app.delete("/api/lists/:listId/collaborators/:username", requireAuth, async (req, res) => {
    const username = req.params.username;
    const user = await prisma.user.findUnique({
      where: { username: req.session.user.name },
    });
    const listId = Number(req.params.listId);
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) return res.status(404).json({ error: "list_not_found" });
    if (list.ownerId !== user.id)
      return res.status(403).json({ error: "forbidden" });
    const collaborator = await prisma.user.findUnique({ where: { username } });
    if (!collaborator) return res.status(404).json({ error: "user_not_found" });
    await prisma.list.update({
      where: { id: listId },
      data: {
        collaborators: {
          disconnect: { id: collaborator.id },
        },
      },
    });
    res.json({ ok: true });
});

//CRUD ToDo
app.post("/api/lists/:listId/todos", requireAuth, async (req, res) => {
  const listId = Number(req.params.listId);
  const { title } = req.body;
  const user = await prisma.user.findUnique({
    where: { username: req.session.user.name },
  });
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { collaborators: true },
  });
  const isOwner = list.ownerId === user.id;
  const isCollaborator = list.collaborators.some((c) => c.id === user.id);
  if (!isOwner && !isCollaborator)
    return res.status(403).json({ error: "forbidden" });
  const todo = await prisma.todo.create({ data: { title, listId } });
  res.json(todo);
});

app.patch("/api/todos/:id", requireAuth, async (req, res) => {
  const todoId = Number(req.params.id);
  const { title, completed } = req.body;
  const user = await prisma.user.findUnique({
    where: { username: req.session.user.name },
  });
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { list: { include: { collaborators: true } } },
  });
  if (!todo) return res.status(404).json({ error: "todo_not_found" });
  const isOwner = todo.list.ownerId === user.id;
  const isCollaborator = todo.list.collaborators.some((c) => c.id === user.id);
  if (!isOwner && !isCollaborator)
    return res.status(403).json({ error: "forbidden" });
  const data = {};
  if (title !== undefined) data.title = title;
  if (completed !== undefined) data.completed = completed;
  const updated = await prisma.todo.update({
    where: { id: todoId },
    data,
  });
  res.json(updated);
});

app.delete("/api/todos/:id", requireAuth, async (req, res) => {
  const todoId = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { username: req.session.user.name },
  });
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { list: { include: { collaborators: true } } },
  });
  if (!todo) return res.status(404).json({ error: "todo_not_found" });
  const isOwner = todo.list.ownerId === user.id;
  const isCollaborator = todo.list.collaborators.some((c) => c.id === user.id);
  if (!isOwner && !isCollaborator)
    return res.status(403).json({ error: "forbidden" });
  await prisma.todo.delete({ where: { id: todoId } });
  res.json({ ok: true });
});
