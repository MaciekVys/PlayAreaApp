import React from "react";
import "../styles/search.scss";

const Search = () => {
  return (
    <div>
      <input
        className="label"
        type="text"
        id="search"
        name="search"
        placeholder="Gracz, drużyna, miasto"
      />
      <button className="button">Szukaj</button>
    </div>
  );
};
export default Search;
