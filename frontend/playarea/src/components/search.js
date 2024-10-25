// Search.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/search.scss";

const Search = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search/${search}`);
  };

  return (
    <form className="Search" onSubmit={handleSubmit}>
      <input
        name="q"
        type="text"
        className="label"
        placeholder="miasto, gracz, drużyna..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="button" disabled={search === ""}>
        Szukaj
      </button>
    </form>
  );
};
export default Search;
