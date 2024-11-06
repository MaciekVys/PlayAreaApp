// Search.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/search.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

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
        Szukaj <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </form>
  );
};
export default Search;
