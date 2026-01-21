const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const todosController = require("../controller/todos.controller");

router.post("/lists/:listId/todos", requireAuth, todosController.createTodo);
router.get("/lists/:listId/todos", requireAuth, todosController.getTodosForList);
router.patch("/todos/:id", requireAuth, todosController.updateTodo);
router.delete("/todos/:id", requireAuth, todosController.deleteTodo);

module.exports = router;
