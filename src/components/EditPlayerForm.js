import React, { useState } from "react";

const EditPlayerForm = ({ player, onSave, onCancel }) => {
  const [editedPlayer, setEditedPlayer] = useState({
    ...player,
    coins: player.assets?.coins || 0,
    gems: player.assets?.gems || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (typeof editedPlayer[name] === "number") {
      parsedValue = parseFloat(value) || 0;
    } else if (typeof editedPlayer[name] === "boolean") {
      parsedValue = value === "true";
    }

    setEditedPlayer((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPlayer = {
      ...editedPlayer,
      assets: {
        ...editedPlayer.assets,
        coins: editedPlayer.coins,
        gems: editedPlayer.gems,
      },
    };
    delete updatedPlayer.coins;
    delete updatedPlayer.gems;
    onSave(updatedPlayer);
  };

  const renderInput = (key, value) => {
    if (key === "id" || key === "created_at") {
      return (
        <span>{typeof value === "object" ? JSON.stringify(value) : value}</span>
      );
    }
    if (typeof value === "boolean") {
      return (
        <select
          name={key}
          value={value.toString()}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }
    return (
      <input
        type={typeof value === "number" ? "number" : "text"}
        name={key}
        value={value}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    );
  };

  const keysToExclude = [
    "keeperIds",
    "mainGuildKeeper",
    "assets",
    "last_login",
    "keepers",
  ];

  const orderedKeys = [
    "id",
    "playerName",
    "level",
    "experience",
    "coins",
    "gems",
    "created_at",
    "order",
    "isBanned",
  ];

  const keys = orderedKeys.filter(
    (key) => !keysToExclude.includes(key) && key in editedPlayer
  );

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
      <div className="grid grid-cols-2 gap-4">
        {keys.map((key) => (
          <div key={key} className="flex items-center">
            <label className="w-1/3 text-right mr-2 text-gray-700 text-sm font-bold">
              {key === "id"
                ? "Player ID"
                : key === "playerName"
                  ? "Name"
                  : key === "created_at"
                    ? "Created At"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
              :
            </label>
            <div className="w-2/3">{renderInput(key, editedPlayer[key])}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditPlayerForm;
