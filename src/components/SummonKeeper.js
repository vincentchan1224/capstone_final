import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  getUserData,
  summonKeeper,
  getSummonRecords,
  getKeeperClass,
} from "../services/api";
import withRefresh from "./withRefresh";

const SummonKeeper = forwardRef((props, ref) => {
  const [assets, setAssets] = useState(null);
  const [summonRecords, setSummonRecords] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userData = await getUserData(userId);
      setAssets(userData.assets);
      const records = await getSummonRecords(userId);

      // Fetch keeper class data for each record
      const recordsWithClassData = await Promise.all(
        records.map(async (record) => {
          const classData = await getKeeperClass(record.keeper.class);
          return {
            ...record,
            keeper: {
              ...record.keeper,
              className: classData.name,
              description: classData.description,
            },
          };
        })
      );

      setSummonRecords(recordsWithClassData);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchData,
  }));

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSummon = async (times) => {
    try {
      const userId = localStorage.getItem("userId");
      const cost = times === 1 ? 100 : 450;
      if (assets.gems < cost) {
        alert("Not enough gems!");
        return;
      }
      await summonKeeper(userId, times);
      fetchData(); // Refresh data after summoning
    } catch (error) {
      console.error("Error summoning keeper:", error);
    }
  };

  return (
    <div className="p-4" data-testid="summon-keeper">
      <h2 className="text-2xl font-bold mb-4">Summon Keeper</h2>
      {lastRefresh && <p>Last refreshed at: {lastRefresh}</p>}
      {assets && <p className="mb-4">Gems: {assets.gems}</p>}
      <button
        onClick={() => handleSummon(1)}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
      >
        Summon 1 (100 gems)
      </button>
      <button
        onClick={() => handleSummon(5)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Summon 5 (450 gems)
      </button>
      <h3 className="text-xl font-bold mt-8 mb-4">Summon History</h3>
      <ul>
        {summonRecords.map((record, index) => (
          <li key={index} className="mb-2">
            {record.keeper.className} - Tier: {record.keeper.tier}, Rarity:{" "}
            {record.keeper.rarity}
            <p className="text-sm text-gray-600">{record.keeper.description}</p>
            <span className="ml-2 text-sm text-gray-500">
              {record.summonMethod} -{" "}
              {new Date(record.summonTime).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default withRefresh(SummonKeeper);
