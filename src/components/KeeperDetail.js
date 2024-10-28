import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useParams } from "react-router-dom";
import Layout from "./Layout";
import { getKeeperDetails, getKeeperClass } from "../services/api";
import withRefresh from "./withRefresh";

const KeeperDetail = forwardRef((props, ref) => {
  const [keeper, setKeeper] = useState(null);
  const [keeperClass, setKeeperClass] = useState(null);
  const { keeperId } = useParams();

  const fetchKeeper = useCallback(async () => {
    try {
      const keeperData = await getKeeperDetails(keeperId);
      setKeeper(keeperData);
      // Fetch keeper class data
      const keeperClassData = await getKeeperClass(keeperData.class);
      setKeeperClass(keeperClassData);
    } catch (error) {
      console.error("Error fetching keeper:", error);
    }
  }, [keeperId]);

  useImperativeHandle(ref, () => ({
    refresh: fetchKeeper,
  }));

  useEffect(() => {
    fetchKeeper();
  }, [fetchKeeper]);

  if (!keeper) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto" data-testid="keeper-detail">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="h-48 flex items-center justify-center bg-gray-200">
          <img
            src={`/img/keeper-classes/class-${keeper.class}-l.webp`}
            alt={keeper.className}
            className="h-full object-contain"
          />
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{keeper.className}</h2>
          <p className="text-yellow-500 text-xl mb-2">
            {"★".repeat(keeper.rarity)}
          </p>
          <p className="text-gray-600 mb-4">{keeper.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Level: {keeper.level}</p>
              <p className="font-semibold">Class: {keeper.className}</p>
              <p className="font-semibold">Tier: {keeper.tier}</p>
            </div>
            <div>
              <p className="font-semibold">
                HP: {keeper.HP}/{keeper.HPMax}
              </p>
              <p className="font-semibold">
                MP: {keeper.MP}/{keeper.MPMax}
              </p>
              <p className="font-semibold">SAN: {keeper.san}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              <p>STR: {keeper.str}</p>
              <p>INT: {keeper.int}</p>
              <p>WILL: {keeper.will}</p>
              <p>DEX: {keeper.dex}</p>
              <p>LUCK: {keeper.luck}</p>
              <p>Potential: {keeper.potential}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default withRefresh(KeeperDetail);
