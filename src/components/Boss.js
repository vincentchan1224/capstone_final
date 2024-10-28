import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, getAllBosses, getKeeperDetails } from "../services/api";
import withRefresh from "./withRefresh";
import ConfirmationModal from "./ConfirmationModal";

const Boss = forwardRef((props, ref) => {
  const [userTeam, setUserTeam] = useState([null, null, null]);
  const [bosses, setBosses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("userId");
      const userData = await getUserData(userId);

      if (userData.mainGuildKeeper) {
        const mainKeepers = await Promise.all(
          userData.mainGuildKeeper.map(async (keeperId) => {
            if (keeperId) {
              return await getKeeperDetails(keeperId);
            }
            return null;
          })
        );
        setUserTeam(mainKeepers);
        console.log("User team:", mainKeepers);
      }

      const bossesData = await getAllBosses();
      console.log("Bosses data:", bossesData); // Log the bosses data
      setBosses(bossesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTeamStats = useCallback(() => {
    return userTeam.reduce(
      (acc, keeper) => {
        if (keeper) {
          acc.str += keeper.str || 0;
          acc.int += keeper.int || 0;
          acc.dex += keeper.dex || 0;
          acc.will += keeper.will || 0;
        }
        return acc;
      },
      { str: 0, int: 0, dex: 0, will: 0 }
    );
  }, [userTeam]);

  const teamStats = calculateTeamStats();

  const handleBossClick = (boss) => {
    setSelectedBoss(boss);
    setShowConfirmation(true);
  };

  const handleConfirmFight = () => {
    setShowConfirmation(false);
    navigate("/boss-fighting", { state: { boss: selectedBoss, teamStats } });
  };

  const renderTeamStatus = () => (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h3 className="text-xl font-bold mb-2">My Guild Team</h3>
      <div className="flex items-center space-x-4">
        {userTeam.map((keeper, index) => (
          <div key={index} className="text-center">
            {keeper ? (
              <img
                src={`/img/keeper-classes/class-${keeper.class}-s.webp`}
                alt={keeper.className}
                className="w-16 h-16 object-cover rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                Empty
              </div>
            )}
            <p className="text-sm mt-1">
              {keeper ? keeper.className : "Empty"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <p>STR: {teamStats.str}</p>
        <p>INT: {teamStats.int}</p>
        <p>DEX: {teamStats.dex}</p>
        <p>WILL: {teamStats.will}</p>
      </div>
      <button
        onClick={() => navigate("/myguild")}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go to My Guild
      </button>
    </div>
  );

  const renderBossList = () => (
    <div>
      <h3 className="text-2xl font-bold mb-4">Boss List</h3>
      {bosses.map((boss) => (
        <BossCard
          key={boss.bossId}
          boss={boss}
          teamStats={teamStats}
          onClick={handleBossClick}
        />
      ))}
    </div>
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6">Boss Battles</h2>
      {renderTeamStatus()}
      {renderBossList()}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmFight}
        title="Confirm Battle"
        message={`Are you sure you want to fight ${selectedBoss?.bossName}?`}
      />
    </div>
  );
});

const BossCard = ({ boss, teamStats, onClick }) => {
  const [timeToRespawn, setTimeToRespawn] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [meetsRequirements, setMeetsRequirements] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let lastDefeat;
      if (boss.lastDefeatTime && boss.lastDefeatTime._seconds) {
        lastDefeat = new Date(boss.lastDefeatTime._seconds * 1000).getTime();
      } else {
        lastDefeat = now; // If lastDefeatTime is invalid, assume it's now
      }
      const respawnTime = boss.respawnTime * 1000; // Convert to milliseconds
      const timeDiff = now - lastDefeat;
      const remainingTime = Math.max(0, respawnTime - timeDiff);
      setTimeToRespawn(remainingTime);
      const available = remainingTime === 0;
      setIsAvailable(available);

      console.log(`Boss ${boss.bossName}:`);
      console.log(`  boss.lastDefeatTime:`, boss.lastDefeatTime);
      console.log(
        `  boss.lastDefeatTime._seconds:`,
        boss.lastDefeatTime._seconds
      );
      console.log(`  Now: ${new Date(now).toISOString()}`);
      console.log(`  Last Defeat: ${new Date(lastDefeat).toISOString()}`);
      console.log(`  Respawn Time: ${respawnTime}ms`);
      console.log(`  Time Diff: ${timeDiff}ms`);
      console.log(`  Remaining Time: ${remainingTime}ms`);
      console.log(`  Is Available: ${available}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [boss]);

  useEffect(() => {
    const meets =
      teamStats.str >= boss.requireTeamStr &&
      teamStats.int >= boss.requireTeamInt &&
      teamStats.dex >= boss.requireTeamDex &&
      teamStats.will >= boss.requireTeamWill;
    setMeetsRequirements(meets);

    console.log(`Boss ${boss.bossName} requirements check:`);
    console.log(
      `  Team STR: ${teamStats.str} >= ${boss.requireTeamStr}: ${teamStats.str >= boss.requireTeamStr}`
    );
    console.log(
      `  Team INT: ${teamStats.int} >= ${boss.requireTeamInt}: ${teamStats.int >= boss.requireTeamInt}`
    );
    console.log(
      `  Team DEX: ${teamStats.dex} >= ${boss.requireTeamDex}: ${teamStats.dex >= boss.requireTeamDex}`
    );
    console.log(
      `  Team WILL: ${teamStats.will} >= ${boss.requireTeamWill}: ${teamStats.will >= boss.requireTeamWill}`
    );
    console.log(`  Meets Requirements: ${meets}`);
  }, [teamStats, boss]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatColor = (teamStat, requiredStat) =>
    teamStat >= requiredStat ? "text-green-500" : "text-red-500";

  const cardClass =
    isAvailable && meetsRequirements
      ? "bg-white cursor-pointer hover:shadow-lg"
      : "bg-gray-300 cursor-not-allowed";

  console.log(
    `Boss ${boss.bossName}: Available: ${isAvailable}, Meets Requirements: ${meetsRequirements}, Time to Respawn: ${timeToRespawn}`
  );

  return (
    <div
      className={`shadow-md rounded-lg p-4 mb-4 flex ${cardClass}`}
      onClick={() => {
        console.log(`Clicked on boss ${boss.bossName}`);
        console.log(
          `isAvailable: ${isAvailable}, meetsRequirements: ${meetsRequirements}`
        );
        if (isAvailable && meetsRequirements) {
          onClick(boss);
        }
      }}
    >
      <img
        src={`/img/bosses/${boss.bossImageSmall}`}
        alt={boss.bossName}
        className="w-24 h-24 object-cover rounded-lg mr-4"
      />
      <div>
        <h4 className="text-xl font-bold">{boss.bossName}</h4>
        <p>
          Time to Respawn:{" "}
          {timeToRespawn > 0 ? formatTime(timeToRespawn) : "Available"}
        </p>
        <p>
          Required STR:{" "}
          <span className={getStatColor(teamStats.str, boss.requireTeamStr)}>
            {boss.requireTeamStr}
          </span>
        </p>
        <p>
          Required INT:{" "}
          <span className={getStatColor(teamStats.int, boss.requireTeamInt)}>
            {boss.requireTeamInt}
          </span>
        </p>
        <p>
          Required DEX:{" "}
          <span className={getStatColor(teamStats.dex, boss.requireTeamDex)}>
            {boss.requireTeamDex}
          </span>
        </p>
        <p>
          Required WILL:{" "}
          <span className={getStatColor(teamStats.will, boss.requireTeamWill)}>
            {boss.requireTeamWill}
          </span>
        </p>
        <p>Coin Drop: {boss.coinDrop}</p>
        <p>Gem Drop: {boss.gemDrop}</p>
      </div>
    </div>
  );
};

export default withRefresh(Boss);
