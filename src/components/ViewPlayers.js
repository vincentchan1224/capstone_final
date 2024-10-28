import React, { useState, useEffect, useCallback } from "react";
import {
  getAllUsers,
  getKeeperDetails,
  getUserData,
  editUser,
  editKeeper,
} from "../services/api";
import Modal from "./Modal";
import EditPlayerForm from "./EditPlayerForm";
import EditKeeperForm from "./EditKeeperForm";
import "./AdminPanel.css";

const ViewPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditKeeperModal, setShowEditKeeperModal] = useState(false);
  const [selectedKeeper, setSelectedKeeper] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allPlayers = await getAllUsers();
      setPlayers(allPlayers);
      setFilteredPlayers(allPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      setError("Failed to load players. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    const filtered = players.filter((player) =>
      player.playerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

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

  const sortedPlayers = React.useMemo(() => {
    let sortableItems = [...filteredPlayers];
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
  }, [filteredPlayers, sortConfig]);

  const handlePlayerClick = async (player) => {
    setIsLoading(true);
    try {
      const fullPlayerData = await getUserData(player.id);
      const keeperIds = fullPlayerData.keeperIds || [];
      const keeperDetails = await Promise.all(keeperIds.map(getKeeperDetails));
      setSelectedPlayer({ ...fullPlayerData, keepers: keeperDetails });
      setShowPlayerModal(true);
    } catch (error) {
      console.error("Error fetching player details:", error);
      setError("Failed to load player details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlayer = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (editedPlayer) => {
    try {
      await editUser(editedPlayer.id, editedPlayer);
      setShowEditModal(false);
      fetchPlayers(); // Refresh the player list
      if (selectedPlayer && selectedPlayer.id === editedPlayer.id) {
        setSelectedPlayer(editedPlayer);
      }
    } catch (error) {
      console.error("Error editing player:", error);
      setError("Failed to edit player. Please try again.");
    }
  };

  const handleEditKeeper = (keeper) => {
    setSelectedKeeper(keeper);
    setShowEditKeeperModal(true);
  };

  const handleSaveKeeperEdit = async (editedKeeper) => {
    try {
      await editKeeper(editedKeeper.id, editedKeeper);
      setShowEditKeeperModal(false);
      setSuccessMessage("Keeper updated successfully!");

      // Update the keeper in the selectedPlayer state
      if (selectedPlayer) {
        const updatedKeepers = selectedPlayer.keepers.map((k) =>
          k.id === editedKeeper.id ? editedKeeper : k
        );
        setSelectedPlayer((prev) => ({ ...prev, keepers: updatedKeepers }));
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error editing keeper:", error);
      setError("Failed to edit keeper. Please try again.");
      // Clear error message after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  };

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search by player name"
        value={searchTerm}
        onChange={handleSearch}
        className="admin-search"
      />
      {successMessage && (
        <div className="text-green-500 mb-2">{successMessage}</div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("playerName")}>Player Name</th>
            <th onClick={() => handleSort("level")}>Level</th>
            <th onClick={() => handleSort("gems")}>Gems</th>
            <th onClick={() => handleSort("created_at")}>Created At</th>
            <th onClick={() => handleSort("last_login")}>Last Login</th>
            <th onClick={() => handleSort("keeperIds")}>Number of Keepers</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player) => (
            <tr key={player.id} onClick={() => handlePlayerClick(player)}>
              <td>{player.playerName}</td>
              <td>{player.level}</td>
              <td>{player.assets?.gems || 0}</td>
              <td>{new Date(player.created_at).toLocaleString()}</td>
              <td>{new Date(player.last_login).toLocaleString()}</td>
              <td>{player.keeperIds?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        title="Player Details"
      >
        {selectedPlayer && (
          <div>
            <h3 className="text-xl font-bold mb-4">
              {selectedPlayer.playerName}
            </h3>
            <p>Level: {selectedPlayer.level}</p>
            <p>Gems: {selectedPlayer.assets?.gems || 0}</p>
            <p>Experience: {selectedPlayer.experience}</p>
            <p>
              Created At: {new Date(selectedPlayer.created_at).toLocaleString()}
            </p>
            <p>
              Last Login: {new Date(selectedPlayer.last_login).toLocaleString()}
            </p>
            <button
              onClick={handleEditPlayer}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Edit Player
            </button>
            <h4 className="text-lg font-bold mt-4 mb-2">Keepers</h4>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Level</th>
                  <th>Rarity</th>
                  <th>STR</th>
                  <th>INT</th>
                  <th>DEX</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedPlayer.keepers.map((keeper) => (
                  <tr key={keeper.id}>
                    <td>{keeper.className}</td>
                    <td>{keeper.level}</td>
                    <td>{keeper.rarity}</td>
                    <td>{keeper.str}</td>
                    <td>{keeper.int}</td>
                    <td>{keeper.dex}</td>
                    <td>
                      <button
                        onClick={() => handleEditKeeper(keeper)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Player"
      >
        {selectedPlayer && (
          <EditPlayerForm
            player={selectedPlayer}
            onSave={handleSaveEdit}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showEditKeeperModal}
        onClose={() => setShowEditKeeperModal(false)}
        title="Edit Keeper"
      >
        {selectedKeeper && (
          <EditKeeperForm
            keeper={selectedKeeper}
            onSave={handleSaveKeeperEdit}
            onCancel={() => setShowEditKeeperModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ViewPlayers;
