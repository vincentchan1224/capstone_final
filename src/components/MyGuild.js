import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  getUserData,
  updateUserData,
  getKeeperDetails,
  getKeeperClass,
} from "../services/api";
import withRefresh from "./withRefresh";
import Modal from "./Modal";

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

const KeeperCard = ({ keeper, onSelect, isSelected, slotIndex }) => (
  <div
    onClick={() => (keeper.isBanned ? null : onSelect(keeper))}
    className={`relative border-4 ${getBorderColorByRarity(keeper.rarity)} ${
      isSelected ? "opacity-50" : ""
    } ${
      keeper.isBanned ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    } rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center bg-white`}
  >
    <img
      src={`/img/keeper-classes/class-${keeper.class}-s.webp`}
      alt={keeper.className}
      className="w-20 h-20 object-cover rounded-full mb-2 border-2 border-gray-300"
    />
    <h4 className="font-bold text-lg mb-1">{keeper.className}</h4>
    <p className="text-yellow-500 text-sm mb-2">{"★".repeat(keeper.rarity)}</p>
    <div className="w-full space-y-2">
      <StatBar label="STR" value={keeper.str} color="bg-red-500" />
      <StatBar label="INT" value={keeper.int} color="bg-blue-500" />
      <StatBar label="DEX" value={keeper.dex} color="bg-green-500" />
    </div>
    {isSelected && (
      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
        {slotIndex === 0 ? "L" : slotIndex}
      </div>
    )}
    {keeper.isBanned && (
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center rounded-lg">
        <span className="text-white font-bold text-xl">BANNED</span>
      </div>
    )}
  </div>
);

const StatBar = ({ label, value, color }) => (
  <div className="flex items-center">
    <span className="w-10 text-xs font-semibold">{label}</span>
    <div className="flex-grow bg-gray-200 h-2 rounded-full ml-2">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
    <span className="w-8 text-xs font-semibold text-right ml-2">{value}</span>
  </div>
);

const StatDisplay = ({ label, value }) => (
  <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-2">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className="font-bold text-gray-800">
      {value.total}
      <span className="text-sm text-gray-600">
        ({value.leader} + {value.member1} + {value.member2})
      </span>
    </span>
  </div>
);

const MyGuild = forwardRef((props, ref) => {
  const [mainGuildKeepers, setMainGuildKeepers] = useState([null, null, null]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [userKeepers, setUserKeepers] = useState([]);
  const [showKeeperSelection, setShowKeeperSelection] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchUserData = useCallback(async () => {
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
        setMainGuildKeepers(mainKeepers);
      }
      if (userData.keeperIds) {
        const keeperDetails = await Promise.all(
          userData.keeperIds.map(getKeeperDetails)
        );
        setUserKeepers(keeperDetails);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchUserData,
  }));

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSlotClick = (index) => {
    setSelectedSlot(index);
    setShowKeeperSelection(true);
  };

  const handleKeeperSelect = async (keeper) => {
    if (keeper.isBanned) {
      setAlertMessage("This keeper is banned and cannot be selected.");
      setShowAlert(true);
      return;
    }

    if (mainGuildKeepers.some((k) => k && k.id === keeper.id)) {
      setAlertMessage("This keeper is already in the team!");
      setShowAlert(true);
      return;
    }

    const newMainGuildKeepers = [...mainGuildKeepers];
    newMainGuildKeepers[selectedSlot] = keeper;
    setMainGuildKeepers(newMainGuildKeepers);
    setShowKeeperSelection(false);

    try {
      const userId = localStorage.getItem("userId");
      await updateUserData(userId, {
        mainGuildKeeper: newMainGuildKeepers.map((k) => (k ? k.id : null)),
      });
    } catch (error) {
      console.error("Error updating main guild keepers:", error);
      setAlertMessage("Error updating team. Please try again.");
      setShowAlert(true);
    }
  };

  const handleKeeperRemove = async (keeper) => {
    const newMainGuildKeepers = mainGuildKeepers.map((k) =>
      k && k.id === keeper.id ? null : k
    );
    setMainGuildKeepers(newMainGuildKeepers);

    try {
      const userId = localStorage.getItem("userId");
      await updateUserData(userId, {
        mainGuildKeeper: newMainGuildKeepers.map((k) => (k ? k.id : null)),
      });
    } catch (error) {
      console.error("Error updating main guild keepers:", error);
      setAlertMessage("Error removing keeper. Please try again.");
      setShowAlert(true);
    }
  };

  const closeKeeperSelection = () => {
    setShowKeeperSelection(false);
  };

  const handleRemoveKeeper = async () => {
    if (selectedSlot === null) return;

    const newMainGuildKeepers = [...mainGuildKeepers];
    newMainGuildKeepers[selectedSlot] = null;
    setMainGuildKeepers(newMainGuildKeepers);

    try {
      const userId = localStorage.getItem("userId");
      await updateUserData(userId, {
        mainGuildKeeper: newMainGuildKeepers.map((k) => (k ? k.id : null)),
      });
      setShowKeeperSelection(false);
    } catch (error) {
      console.error("Error removing keeper:", error);
      setAlertMessage("Error removing keeper. Please try again.");
      setShowAlert(true);
    }
  };

  const sortedUserKeepers = [...userKeepers].sort((a, b) => {
    const aIndex = mainGuildKeepers.findIndex((k) => k && k.id === a.id);
    const bIndex = mainGuildKeepers.findIndex((k) => k && k.id === b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return b.level - a.level;
  });

  const mainTeamRef = useRef(null);
  const [selectionBoxTop, setSelectionBoxTop] = useState(0);

  useEffect(() => {
    if (mainTeamRef.current && showKeeperSelection) {
      const rect = mainTeamRef.current.getBoundingClientRect();
      const slotHeight = rect.height / 3; // Assuming 3 slots
      setSelectionBoxTop(rect.top + window.scrollY + slotHeight * 1.7);
    }
  }, [showKeeperSelection]);

  const calculateTeamStats = () => {
    const stats = {
      str: { total: 0, leader: 0, member1: 0, member2: 0 },
      int: { total: 0, leader: 0, member1: 0, member2: 0 },
      dex: { total: 0, leader: 0, member1: 0, member2: 0 },
      will: { total: 0, leader: 0, member1: 0, member2: 0 },
      luck: { total: 0, leader: 0, member1: 0, member2: 0 },
    };

    mainGuildKeepers.forEach((keeper, index) => {
      if (keeper) {
        const memberKey = index === 0 ? "leader" : `member${index}`;
        stats.str[memberKey] = keeper.str;
        stats.int[memberKey] = keeper.int;
        stats.dex[memberKey] = keeper.dex;
        stats.will[memberKey] = keeper.will;
        stats.luck[memberKey] = keeper.luck;

        stats.str.total += keeper.str;
        stats.int.total += keeper.int;
        stats.dex.total += keeper.dex;
        stats.will.total += keeper.will;
        stats.luck.total += keeper.luck;
      }
    });

    return stats;
  };

  const teamStats = calculateTeamStats();

  return (
    <div className="p-4 relative h-full bg-gray-100" data-testid="my-guild">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Guild Keeper Team
      </h2>
      <div ref={mainTeamRef} className="flex justify-center space-x-6 mb-6">
        {["Leader", "Member 1", "Member 2"].map((title, index) => (
          <div key={index} className="w-1/3 text-center">
            <h3 className="font-bold mb-1 text-base text-gray-700">{title}</h3>
            <div
              onClick={() => handleSlotClick(index)}
              className={`w-full h-48 border-4 ${
                mainGuildKeepers[index]
                  ? getBorderColorByRarity(mainGuildKeepers[index].rarity)
                  : "border-gray-300"
              } ${
                selectedSlot === index
                  ? "ring-4 ring-red-500 animate-pulse"
                  : ""
              } rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              {mainGuildKeepers[index] ? (
                <img
                  src={`/img/keeper-classes/class-${mainGuildKeepers[index].class}-l.webp`}
                  alt={mainGuildKeepers[index].className}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-lg">Empty</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Team Stats</h3>
        <div className="space-y-2">
          <StatDisplay label="STR" value={teamStats.str} />
          <StatDisplay label="INT" value={teamStats.int} />
          <StatDisplay label="DEX" value={teamStats.dex} />
          <StatDisplay label="WILL" value={teamStats.will} />
          <StatDisplay label="LUCK" value={teamStats.luck} />
        </div>
      </div>

      {showKeeperSelection && (
        <div
          className="fixed inset-x-0 z-40 mx-auto"
          style={{
            top: `${selectionBoxTop}px`,
            maxWidth: "28rem", // This matches the max-width of the game container
          }}
        >
          <div
            className="bg-white p-6 rounded-t-lg shadow-lg overflow-y-auto border-2 border-gray-200"
            style={{
              height: `calc(100vh - ${selectionBoxTop}px)`,
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Select a Keeper
              </h3>
              <div>
                <button
                  onClick={handleRemoveKeeper}
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 transition-colors duration-300"
                >
                  Remove
                </button>
                <button
                  onClick={closeKeeperSelection}
                  className="text-gray-600 hover:text-gray-800 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div
              className="grid grid-cols-3 gap-4 overflow-y-auto"
              style={{ maxHeight: `calc(100% - 60px)` }}
            >
              {sortedUserKeepers.map((keeper) => (
                <KeeperCard
                  key={keeper.id}
                  keeper={keeper}
                  onSelect={handleKeeperSelect}
                  isSelected={mainGuildKeepers.some(
                    (k) => k && k.id === keeper.id
                  )}
                  slotIndex={mainGuildKeepers.findIndex(
                    (k) => k && k.id === keeper.id
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Alert"
      >
        <p className="text-gray-700">{alertMessage}</p>
      </Modal>
    </div>
  );
});

export default withRefresh(MyGuild);
