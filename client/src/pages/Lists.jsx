import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ListCard.css";

export default function Lists() {
  const [owned, setOwned] = useState([]);
  const [collab, setCollab] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  async function loadLists(){
    const res=await fetch("http://localhost:3000/api/lists",{credentials:"include"});
    if(res.status === 401){
      navigate("/login");
      return;
    }
    const data = await res.json();
    setOwned(data.owned);
    setCollab(data.collaborating);
  }
  loadLists();
}, [navigate]);

  return (
    <div>
      <h1>Your Lists</h1>

      <h2>Owned Lists:</h2>
      <ul>
        {owned.map(list => (
          <div key={list.id} className="list-card" onClick={()=>navigate(`/lists/${list.id}`)}>{list.name}</div>
        ))}
      </ul>

      <h2>Collaborating On:</h2>
      <ul>
        {collab.map(list => (
          <div key={list.id} className="list-card" onClick={()=>navigate(`/lists/${list.id}`)}>{list.name}</div>
        ))}
      </ul>
    </div>
  );
}
