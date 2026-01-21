const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const listsController = require("../controller/lists.controller");

router.post("/lists", requireAuth, listsController.createList);
router.get("/lists", requireAuth, listsController.getLists);
router.get("/lists/:listId", requireAuth, listsController.getListById);
router.patch("/lists/:listId", requireAuth, listsController.updateList);
router.delete("/lists/:listId", requireAuth, listsController.deleteList);
router.post("/lists/:listId/collaborators", requireAuth, listsController.addCollaborator);
router.delete("/lists/:listId/collaborators/:username",requireAuth,listsController.removeCollaborator);

module.exports = router;
