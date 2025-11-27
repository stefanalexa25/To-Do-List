import { useParams } from "react-router-dom";

export default function Todos() {
  const { id } = useParams();

  return (
    <div>
      <h1>Todos for list {id}</h1>
    </div>
  );
}
