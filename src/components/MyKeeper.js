import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Link } from "react-router-dom";
import { getUserData, getKeeperDetails } from "../services/api";
import withRefresh from "./withRefresh";

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

const KeeperCard = ({ keeper, keeperId }) => (
  <Link to={`/keeper/${keeperId}`} className="block">
    <div
      className={`bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 border-4 ${getBorderColorByRarity(keeper.rarity)}`}
    >
      <img
        src={`/img/keeper-classes/class-${keeper.class}-l.webp`}
        alt={keeper.className}
        className="w-full h-32 object-cover mb-2 rounded"
      />
      <h3 className="font-bold text-lg">{keeper.className}</h3>
      <p className="text-yellow-500">{"★".repeat(keeper.rarity)}</p>
      <p className="text-sm text-gray-600">Level: {keeper.level}</p>
      <div className="mt-2">
        <div className="bg-red-200 rounded-full h-2 w-full">
          <div
            className="bg-red-500 rounded-full h-2"
            style={{ width: `${(keeper.HP / keeper.HPMax) * 100}%` }}
          ></div>
        </div>
        <div className="bg-blue-200 rounded-full h-2 w-full mt-1">
          <div
            className="bg-blue-500 rounded-full h-2"
            style={{ width: `${(keeper.MP / keeper.MPMax) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  </Link>
);

const MyKeeper = forwardRef((props, ref) => {
  const [keepers, setKeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKeepers = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const userData = await getUserData(userId);
      const keeperIds = userData.keeperIds || [];
      const keeperDetails = await Promise.all(keeperIds.map(getKeeperDetails));
      setKeepers(
        keeperDetails.map((keeper, index) => ({
          ...keeper,
          id: keeperIds[index],
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching keepers:", error);
      setError("Failed to load keepers. Please try again.");
      setLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchKeepers,
  }));

  useEffect(() => {
    fetchKeepers();
  }, [fetchKeepers]);

  if (loading) return <div>Loading keepers...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 max-w-md mx-auto" data-testid="my-keeper">
      <h2 className="text-2xl font-bold mb-4">My Keepers</h2>
      <div className="grid grid-cols-2 gap-4">
        {keepers.map((keeper) => (
          <KeeperCard key={keeper.id} keeper={keeper} keeperId={keeper.id} />
        ))}
      </div>
    </div>
  );
});

export default withRefresh(MyKeeper);
