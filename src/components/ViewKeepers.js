import React, { useState, useEffect, useCallback } from "react";
import {
  getAllKeepers,
  banKeeper,
  editKeeper,
  getUserData,
  getKeeperDetails,
} from "../services/api";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import EditKeeperForm from "./EditKeeperForm";
import "./AdminPanel.css";

const ViewKeepers = () => {
  const [keepers, setKeepers] = useState([]);
  const [filteredKeepers, setFilteredKeepers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "order",
    direction: "ascending",
  });
  const [selectedKeeper, setSelectedKeeper] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBanConfirmation, setShowBanConfirmation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchKeepers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allKeepers = await getAllKeepers();
      console.log("Fetched keepers:", allKeepers);
      const validKeepers = allKeepers.filter(
        (keeper) => keeper.id !== "initialize"
      );

      // Fetch player names for each keeper
      const keepersWithPlayerNames = await Promise.all(
        validKeepers.map(async (keeper) => {
          if (keeper.ownerId) {
            const userData = await getUserData(keeper.ownerId);
            return { ...keeper, ownerName: userData.playerName };
          }
          return keeper;
        })
      );

      setKeepers(keepersWithPlayerNames);
      setFilteredKeepers(keepersWithPlayerNames);
    } catch (error) {
      console.error("Error fetching keepers:", error);
      setError("Failed to load keepers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeepers();
  }, [fetchKeepers]);

  useEffect(() => {
    const filtered = keepers.filter(
      (keeper) =>
        getKeeperClassName(keeper.class)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        keeper.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKeepers(filtered);
  }, [searchTerm, keepers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedKeepers = React.useMemo(() => {
    let sortableItems = [...filteredKeepers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredKeepers, sortConfig]);

  const handleKeeperClick = (keeper) => {
    setSelectedKeeper(keeper);
    setIsModalOpen(true);
  };

  const getKeeperClassName = (classId) => {
    const classNames = {
      1: "Knight",
      2: "Mage",
      3: "Ninja",
      4: "Blacksmith",
      5: "Ranger",
      6: "Rogue",
      7: "Citizen",
      8: "Farmer",
    };
    return classNames[classId] || "Unknown";
  };

  const formatDate = (seconds) => {
    return new Date(seconds * 1000).toLocaleString();
  };

  const handleBanKeeper = async () => {
    try {
      await banKeeper(selectedKeeper.id);
      fetchKeepers(); // Refresh the keeper list
      setShowBanConfirmation(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error banning keeper:", error);
      setError("Failed to ban keeper. Please try again.");
    }
  };

  const handleEditKeeper = (keeper) => {
    setSelectedKeeper(keeper);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (editedKeeper) => {
    try {
      await editKeeper(editedKeeper.id, editedKeeper);
      setShowEditModal(false);

      // Refresh the keeper list
      fetchKeepers();

      // Refresh the selected keeper details
      if (selectedKeeper && selectedKeeper.id === editedKeeper.id) {
        const refreshedKeeper = await getKeeperDetails(editedKeeper.id);
        setSelectedKeeper(refreshedKeeper);
      }
    } catch (error) {
      console.error("Error editing keeper:", error);
      setError("Failed to edit keeper. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading keepers...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search by keeper class or owner name"
        value={searchTerm}
        onChange={handleSearch}
        className="admin-search"
      />
      <table className="admin-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("order")}>Order</th>
            <th onClick={() => handleSort("class")}>Class</th>
            <th onClick={() => handleSort("ownerName")}>Owner</th>
            <th onClick={() => handleSort("level")}>Level</th>
            <th onClick={() => handleSort("str")}>STR</th>
            <th onClick={() => handleSort("int")}>INT</th>
            <th onClick={() => handleSort("dex")}>DEX</th>
            <th onClick={() => handleSort("rarity")}>Rarity</th>
            <th onClick={() => handleSort("summonedAt")}>Summoned At</th>
          </tr>
        </thead>
        <tbody>
          {sortedKeepers.map((keeper) => (
            <tr key={keeper.id} onClick={() => handleKeeperClick(keeper)}>
              <td>{keeper.order}</td>
              <td>{getKeeperClassName(keeper.class)}</td>
              <td>{keeper.ownerName || "Unknown"}</td>
              <td>{keeper.level}</td>
              <td>{keeper.str}</td>
              <td>{keeper.int}</td>
              <td>{keeper.dex}</td>
              <td>{keeper.rarity}</td>
              <td>
                {keeper.summonedAt
                  ? formatDate(keeper.summonedAt._seconds)
                  : "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Keeper Details"
      >
        {selectedKeeper && (
          <KeeperCard
            keeper={selectedKeeper}
            onBan={() => setShowBanConfirmation(true)}
            onEdit={() => handleEditKeeper(selectedKeeper)}
          />
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showBanConfirmation}
        onClose={() => setShowBanConfirmation(false)}
        title="Confirm Ban"
        message="Are you sure you want to ban this keeper?"
        onConfirm={handleBanKeeper}
      />

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Keeper"
      >
        {selectedKeeper && (
          <EditKeeperForm
            keeper={selectedKeeper}
            onSave={handleSaveEdit}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const KeeperCard = ({ keeper, onBan, onEdit }) => {
  const getKeeperClassName = (classId) => {
    const classNames = {
      1: "Knight",
      2: "Mage",
      3: "Ninja",
      4: "Blacksmith",
      5: "Ranger",
      6: "Rogue",
      7: "Citizen",
      8: "Farmer",
    };
    return classNames[classId] || "Unknown";
  };

  const formatDate = (seconds) => {
    return new Date(seconds * 1000).toLocaleString();
  };

  return (
    <div
      className={`border-4 ${getBorderColorByRarity(keeper.rarity)} rounded-lg p-4`}
    >
      <h3 className="font-bold">{getKeeperClassName(keeper.class)}</h3>
      <p>Level: {keeper.level}</p>
      <p>Rarity: {"★".repeat(keeper.rarity)}</p>
      <p>STR: {keeper.str}</p>
      <p>INT: {keeper.int}</p>
      <p>DEX: {keeper.dex}</p>
      <p>LUCK: {keeper.luck}</p>
      <p>WILL: {keeper.will}</p>
      <p>Potential: {keeper.potential}</p>
      <p>Tier: {keeper.tier}</p>
      <p>Is Banned: {keeper.isBanned ? "Yes" : "No"}</p>
      <p>Owner ID: {keeper.ownerId}</p>
      <p>Owner Name: {keeper.ownerName || "Unknown"}</p>
      <p>
        Summoned At:{" "}
        {keeper.summonedAt ? formatDate(keeper.summonedAt._seconds) : "Unknown"}
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={onBan}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {keeper.isBanned ? "Unban" : "Ban"}
        </button>
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

const getBorderColorByRarity = (rarity) => {
  switch (rarity) {
    case 5:
      return "border-yellow-400";
    case 4:
      return "border-purple-500";
    case 3:
      return "border-blue-500";
    case 2:
      return "border-green-500";
    default:
      return "border-gray-800";
  }
};

export default ViewKeepers;
