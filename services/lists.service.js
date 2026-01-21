const prisma = require("../prisma");

function err(status, code) {
  const e = new Error(code);
  e.status = status;
  e.code = code;
  return e;
}

async function createList({ name, sessionUsername }) {
  const user = await prisma.user.findUnique({
    where: { username: sessionUsername },
  });
  const list = await prisma.list.create({
    data: { name, ownerId: user.id },
  });
  return list;
}

async function getLists({ sessionUsername }) {
  const user = await prisma.user.findUnique({
    where: { username: sessionUsername },
    include: { lists: true, collabLists: true },
  });
  return {
    owned: user.lists,
    collaborating: user.collabLists,
  };
}

async function getListById({ listId, sessionUsername }) {
  const user = await prisma.user.findUnique({where: { username: sessionUsername },});
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { collaborators: true },
  });
  if (!list) throw err(404, "list_not_found");
  const isOwner = list.ownerId === user.id;
  const isCollaborator = list.collaborators.some((c) => c.id === user.id);
  if (!isOwner && !isCollaborator) throw err(403, "forbidden");
  return { id: list.id, name: list.name };
}

async function updateList({ listId, sessionUsername, name }) {
  if (!name || !name.trim()) throw err(400, "name_required");
  const user = await prisma.user.findUnique({ where: { username: sessionUsername } });
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw err(404, "list_not_found");
  if (list.ownerId !== user.id) throw err(403, "forbidden"); //numai ownerul poate modifica  
  return prisma.list.update({
    where: { id: listId },
    data: { name: name.trim() },
  });
}

async function deleteList({ listId, sessionUsername }) {
  const user = await prisma.user.findUnique({ where: { username: sessionUsername } });

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { collaborators: true },
  });
  if (!list) throw err(404, "list_not_found");

  if (list.ownerId !== user.id) throw err(403, "forbidden");

  await prisma.$transaction([
    prisma.todo.deleteMany({ where: { listId } }),
    prisma.list.update({ //disconnect collaborators
      where: { id: listId },
      data: {
        collaborators: {
          set: [],},},
    }),
    prisma.list.delete({ where: { id: listId } }),
  ]);
}

async function addCollaborator({ listId, ownerUsername, collaboratorUsername }) {
  const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw err(404, "list_not_found");
  if (list.ownerId !== owner.id) throw err(403, "forbidden");
  const collaborator = await prisma.user.findUnique({
    where: { username: collaboratorUsername },
  });
  if (!collaborator) throw err(404, "user_not_found");
  await prisma.list.update({
    where: { id: listId },
    data: { collaborators: { connect: { id: collaborator.id },},},
  });
}

async function removeCollaborator({ listId, ownerUsername, collaboratorUsername }) {
  const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw err(404, "list_not_found");
  if (list.ownerId !== owner.id) throw err(403, "forbidden");
  const collaborator = await prisma.user.findUnique({
    where: { username: collaboratorUsername },
  });
  if (!collaborator) throw err(404, "user_not_found");
  await prisma.list.update({
    where: { id: listId },
    data: { collaborators: { disconnect: { id: collaborator.id },},},
  });
}

module.exports = { createList, getLists, getListById, updateList, deleteList, addCollaborator, removeCollaborator };
