import { useEffect, useState ,useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ListCard.css";

export default function Lists() {
  const [owned, setOwned] = useState([]);
  const [collab, setCollab] = useState([]);
  const navigate = useNavigate();
  const [newListName, setNewListName] = useState(""); //add list
  const [editingListId,setEditingListId] = useState(null); //edit list
  const [editingName,setEditingName] = useState("");
  
  const loadLists = useCallback(async()=>{
  const res = await fetch("http://localhost:3000/api/lists",{credentials:"include"});
  if (res.status === 401) { return { unauthorized: true };}
  if(!res.ok) {return {error:true} }
  const data = await res.json();
  setOwned(data.owned);
  setCollab(data.collaborating);
},[]);

useEffect(() => {
  (async () => {
    const result = await loadLists();

    if (result?.unauthorized) {
      navigate("/login");
    }
  })();
}, [loadLists, navigate]);


async function addList(){
  const name=newListName.trim();
  if(!name) return;
  const res=await fetch("http://localhost:3000/api/lists",{
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body:JSON.stringify({name})
  });
    if(res.status === 401){
    navigate("/login");
    return;
  }
  if(!res.ok) return;
  setNewListName("");
  await loadLists();
}

function startEdit(list, e){
  e.stopPropagation();
  setEditingListId(list.id);
  setEditingName(list.name);
}

function cancelEdit(e){
  if(e) e.stopPropagation();
  setEditingListId(null);
  setEditingName("");
}

async function saveEdit(listId,e){
  e.stopPropagation();
  const name = editingName.trim();
  if(!name) return;
  const res = await fetch(`http://localhost:3000/api/lists/${listId}`,{
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (res.status === 401) {
    navigate("/login");
    return;
  }
  if (!res.ok) return;
  setEditingListId(null);
  setEditingName("");
  await loadLists();
}

async function deleteList(listId, e) {
  e.stopPropagation();
  const ok = window.confirm("Delete this list? This will remove all todos within.");
  if (!ok) return;
  const res = await fetch(`http://localhost:3000/api/lists/${listId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 401) {
    navigate("/login");
    return;
  }
  if (!res.ok) return;
  if (editingListId === listId) {
    setEditingListId(null);
    setEditingName("");
  }
  await loadLists();
}

async function logout() {
  const ok = window.confirm("Are you sure you want to log out?");
  if (!ok) return;
  const res = await fetch("http://localhost:3000/api/logout", {
    method: "POST",
    credentials: "include",
  });
  navigate("/login");
  if(!res.ok) {
    navigate("/login"); 
    return;
  }
}

  return (
    <div className="lists-page">
      <div className="lists-header">
        <h1>Your Lists</h1>
        <button className="logout-button" onClick={logout} type="button">Logout</button>
      </div>
      <h2>Owned Lists:</h2>
      <ul className="lists-container">
      {owned.map((list) => (
        <div key={list.id} className="list-card list-card-owned"onClick={() => navigate(`/lists/${list.id}`)}>
          {editingListId === list.id ? (
            <div className="list-edit">
              <input className="list-edit-input" value={editingName} onChange={(e) => setEditingName(e.target.value)} onClick={(e) => e.stopPropagation()}/>
              <button className="list-edit-save" onClick={(e) => saveEdit(list.id, e)}>Save</button>
              <button className="list-edit-cancel" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <div className="list-view">
              <span className="list-name">{list.name}</span>
              <div className="list-actions">
                <button className="list-edit-button" onClick={(e) => startEdit(list, e)}>Edit ✏️</button>
                <button className="list-delete-button" onClick={(e) => deleteList(list.id, e)}>Delete 🗑️</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </ul>
      <div className="add-list">
        <input className="add-list-input" value={newListName} onChange={(e)=>setNewListName(e.target.value)} placeholder="Add list here..."/>
        <button className="add-list-button" onClick={addList}>Add List</button>
      </div>
      <h2>Collaborating On:</h2>
      <ul>
        {collab.map(list => (
          <div key={list.id} className="list-card list-card-collab" onClick={()=>navigate(`/lists/${list.id}`)}>
            <span className="list-name">{list.name}</span>
          </div>
        ))}
      </ul>
    </div>
  );
}
