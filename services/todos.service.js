const prisma = require("../prisma");

function err(status, code) {
  const e = new Error(code);
  e.status = status;
  e.code = code;
  return e;
}

async function assertListAccess({ list, userId }) {
  const isOwner = list.ownerId === userId;
  const isCollaborator = list.collaborators.some((c) => c.id === userId);
  if (!isOwner && !isCollaborator) {
    throw err(403, "forbidden");
  }
}

async function createTodo({ listId, title, sessionUsername }) {
  const user = await prisma.user.findUnique({
    where: { username: sessionUsername },
  });
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { collaborators: true },
  });
  if (!list) throw err(404, "list_not_found");
  await assertListAccess({ list, userId: user.id });
  return prisma.todo.create({
    data: { title, listId },
  });
}

async function getTodosForList({ listId, sessionUsername }) {
  const user = await prisma.user.findUnique({
    where: { username: sessionUsername },
  });
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { collaborators: true, todos: true },
  });
  if (!list) throw err(404, "list_not_found");
  await assertListAccess({ list, userId: user.id });
  return list.todos;
}

async function updateTodo({ todoId, sessionUsername, patch }) {
  const user = await prisma.user.findUnique({
    where: { username: sessionUsername },
  });
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { list: { include: { collaborators: true } } },
  });
  if (!todo) throw err(404, "todo_not_found");
  await assertListAccess({ list: todo.list, userId: user.id });
  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.completed !== undefined) data.completed = patch.completed;
  return prisma.todo.update({
    where: { id: todoId },
    data,
  });
}

async function deleteTodo({ todoId, sessionUsername }) {
  const user = await prisma.user.findUnique({
    where: { username: sessionUsername },
  });
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { list: { include: { collaborators: true } } },
  });
  if (!todo) throw err(404, "todo_not_found");
  await assertListAccess({ list: todo.list, userId: user.id });
  await prisma.todo.delete({ where: { id: todoId } });
}

module.exports = { createTodo, getTodosForList, updateTodo, deleteTodo };
