import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { getUserData, updateUserData } from "../services/api";
import withRefresh from "./withRefresh";

const Assert = forwardRef((props, ref) => {
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const data = await getUserData(userId);
      setAssets(data.assets || { coins: 0, gems: 0 });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setLoading(false);
      setMessage("Error loading assets. Please try again.");
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchAssets,
  }));

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAddGem = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const updatedAssets = { ...assets, gems: (assets.gems || 0) + 100 };
      await updateUserData(userId, { assets: updatedAssets });
      setAssets(updatedAssets);
      setMessage("100 gems added successfully!");
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error("Error adding gems:", error);
      setMessage("Error adding gems. Please try again.");
    }
  };

  return (
    <div className="p-4" data-testid="assert-component">
      <h2 className="text-2xl font-bold mb-4">Assets</h2>
      {loading ? (
        <p>Loading assets...</p>
      ) : assets ? (
        <>
          <p>Coins: {assets.coins || 0}</p>
          <p>Gems: {assets.gems || 0}</p>
          <button
            onClick={handleAddGem}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add 100 Gems
          </button>
          {message && (
            <p className="mt-2 text-green-500 font-semibold">{message}</p>
          )}
        </>
      ) : (
        <p>No assets found. Please try again.</p>
      )}
    </div>
  );
});

export default withRefresh(Assert);
