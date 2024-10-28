import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { defeatBoss, getUserData, getKeeperDetails } from "../services/api";
import withRefresh from "./withRefresh";
import "./BossFighting.css";

const BossFighting = forwardRef((props, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { boss, teamStats } = location.state;
  const [showResult, setShowResult] = useState(false);
  const [battlePhase, setBattlePhase] = useState(0);
  const [teamKeepers, setTeamKeepers] = useState([]);
  const [userAssets, setUserAssets] = useState({ coins: 0, gems: 0 });

  useImperativeHandle(ref, () => ({
    refresh: fetchData,
  }));

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    const userData = await getUserData(userId);
    setUserAssets(userData.assets || { coins: 0, gems: 0 });
    const keeperPromises = userData.mainGuildKeeper.map((keeperId) =>
      keeperId ? getKeeperDetails(keeperId) : null
    );
    const keepers = await Promise.all(keeperPromises);
    setTeamKeepers(keepers);
  };

  useEffect(() => {
    fetchData();

    const battleSequence = [
      setTimeout(() => setBattlePhase(1), 1000), // Team appears
      setTimeout(() => setBattlePhase(2), 2000), // Boss appears
      setTimeout(() => setBattlePhase(3), 3000), // Team attacks
      setTimeout(() => setBattlePhase(4), 4000), // Boss takes damage
      setTimeout(() => setBattlePhase(5), 5000), // Boss defeated
      setTimeout(() => {
        setShowResult(true);
        updatePlayerAndBoss();
      }, 6000),
    ];

    return () => battleSequence.forEach(clearTimeout);
  }, []);

  const updatePlayerAndBoss = async () => {
    const userId = localStorage.getItem("userId");
    try {
      await defeatBoss(boss.bossId, userId, boss.coinDrop, boss.gemDrop);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Boss Battle</h1>
      <div className="w-full max-w-md relative mb-6">
        <div className="battle-scene">
          <div className={`team ${battlePhase >= 1 ? "appear" : ""}`}>
            {teamKeepers.map(
              (keeper, index) =>
                keeper && (
                  <img
                    key={index}
                    src={`/img/keeper-classes/class-${keeper.class}-s.webp`}
                    alt={keeper.className}
                    className="team-keeper"
                  />
                )
            )}
          </div>
          <div
            className={`boss ${battlePhase >= 2 ? "appear" : ""} ${
              battlePhase >= 4 ? "damage" : ""
            } ${battlePhase >= 5 ? "defeated" : ""}`}
          >
            <img
              src={`/img/bosses/${boss.bossImageLarge}`}
              alt={boss.bossName}
              className="w-full h-auto"
            />
          </div>
          {battlePhase >= 3 && <div className="attack-effect"></div>}
        </div>
      </div>
      {showResult && (
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold mb-4">Victory!</h2>
          <p className="mb-2">You defeated {boss.bossName}!</p>
          <p className="mb-2">
            Coins:{" "}
            <span className="text-yellow-500">
              {userAssets.coins} &gt; {userAssets.coins + boss.coinDrop}
            </span>{" "}
            (+{boss.coinDrop})
          </p>
          <p className="mb-4">
            Gems:{" "}
            <span className="text-blue-500">
              {userAssets.gems} &gt; {userAssets.gems + boss.gemDrop}
            </span>{" "}
            (+{boss.gemDrop})
          </p>
          <button
            onClick={() => navigate("/boss")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Boss List
          </button>
        </div>
      )}
    </div>
  );
});

export default withRefresh(BossFighting);
