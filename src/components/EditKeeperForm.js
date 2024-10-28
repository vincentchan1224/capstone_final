import React, { useState, useEffect } from "react";
import { getUserData } from "../services/api";

const EditKeeperForm = ({ keeper, onSave, onCancel }) => {
  const [editedKeeper, setEditedKeeper] = useState(keeper);
  const [ownerName, setOwnerName] = useState("Unknown");

  useEffect(() => {
    const fetchOwnerName = async () => {
      if (keeper.ownerId) {
        try {
          const userData = await getUserData(keeper.ownerId);
          setOwnerName(userData.playerName);
        } catch (error) {
          console.error("Error fetching owner name:", error);
        }
      }
    };
    fetchOwnerName();
  }, [keeper.ownerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (typeof keeper[name] === "number") {
      parsedValue = parseFloat(value) || 0;
    } else if (typeof keeper[name] === "boolean") {
      parsedValue = value === "true";
    }

    setEditedKeeper((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedKeeper);
  };

  const renderInput = (key, value) => {
    if (key === "order") {
      return <span>{value}</span>;
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

  const keysToExclude = ["id", "summonedAt", "className", "description"];
  const keysOrder = [
    "order",
    "ownerId",
    "class",
    "level",
    "tier",
    "rarity",
    "HPMax",
    "MPMax",
    "str",
    "int",
    "dex",
    "will",
    "luck",
    "potential",
    "san",
    "HP",
    "MP",
    "isBanned",
  ];
  const keys = keysOrder.filter(
    (key) => !keysToExclude.includes(key) && key in editedKeeper
  );

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
      <div className="grid grid-cols-2 gap-4">
        {keys.map((key) => (
          <div
            key={key}
            className={`flex items-center ${key === "ownerId" ? "col-span-2" : ""}`}
          >
            <label
              className={`${key === "ownerId" ? "w-1/6" : "w-1/3"} text-right mr-2 text-gray-700 text-sm font-bold`}
            >
              {key}:
            </label>
            <div className={`${key === "ownerId" ? "w-5/6" : "w-2/3"}`}>
              {key === "ownerId" ? (
                <div className="flex items-center">
                  {renderInput(key, editedKeeper[key])}
                  <span className="ml-2 text-gray-500">({ownerName})</span>
                </div>
              ) : (
                renderInput(key, editedKeeper[key])
              )}
            </div>
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

export default EditKeeperForm;
