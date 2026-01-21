const todosService = require("../services/todos.service");

async function createTodo(req, res) {
  try {
    const todo = await todosService.createTodo({
      listId: Number(req.params.listId),
      title: req.body.title,
      sessionUsername: req.session.user.name,
    });
    res.json(todo);} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function getTodosForList(req, res) {
  try {
    const todos = await todosService.getTodosForList({
      listId: Number(req.params.listId),
      sessionUsername: req.session.user.name,
    });
    res.json(todos);
  } catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function updateTodo(req, res) {
  try {
    const updated = await todosService.updateTodo({
      todoId: Number(req.params.id),
      sessionUsername: req.session.user.name,
      patch: {
        title: req.body.title,
        completed: req.body.completed,},
    });
    res.json(updated);} 
  catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function deleteTodo(req, res) {
  try {
    await todosService.deleteTodo({
      todoId: Number(req.params.id),
      sessionUsername: req.session.user.name,
    });
    res.json({ ok: true });} 
  catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

module.exports = { createTodo, getTodosForList, updateTodo, deleteTodo };
