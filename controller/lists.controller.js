const listsService = require("../services/lists.service");

async function createList(req, res) {
  try {
    const list = await listsService.createList({
      name: req.body.name,
      sessionUsername: req.session.user.name,});
    res.json(list);} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function getLists(req, res) {
  try {
    const data = await listsService.getLists({
      sessionUsername: req.session.user.name,});
    res.json(data);} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function getListById(req, res) {
  try {
    const list = await listsService.getListById({
      listId: Number(req.params.listId),
      sessionUsername: req.session.user.name,
    });
    res.json(list);} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function updateList(req, res) {
  try {
    const updated = await listsService.updateList({
      listId: Number(req.params.listId),
      sessionUsername: req.session.user.name,
      name: req.body.name,
    });
    res.json(updated);} 
  catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function deleteList(req, res) {
  try {
    await listsService.deleteList({
      listId: Number(req.params.listId),
      sessionUsername: req.session.user.name,
    });
    res.json({ ok: true });} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function addCollaborator(req, res) {
  try {
    await listsService.addCollaborator({
      listId: Number(req.params.listId),
      ownerUsername: req.session.user.name,
      collaboratorUsername: req.body.username,});
    res.json({ ok: true });} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

async function removeCollaborator(req, res) {
  try {
    await listsService.removeCollaborator({
      listId: Number(req.params.listId),
      ownerUsername: req.session.user.name,
      collaboratorUsername: req.params.username,
    });
    res.json({ ok: true });} 
    catch (err) {res.status(err.status || 500).json({ error: err.code || "server_error" });}
}

module.exports = { createList, getLists, getListById, updateList, deleteList, addCollaborator, removeCollaborator };
