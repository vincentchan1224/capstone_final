import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import withRefresh from "./withRefresh";

const Keeper = forwardRef((props, ref) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Keeper</h2>
      <Link
        to="/summon-keeper"
        className="bg-blue-500 text-white px-4 py-2 rounded block text-center mb-4"
      >
        Summon Keeper
      </Link>
      <Link
        to="/my-keeper"
        className="bg-green-500 text-white px-4 py-2 rounded block text-center"
      >
        My Keeper
      </Link>
    </div>
  );
});

export default withRefresh(Keeper);
