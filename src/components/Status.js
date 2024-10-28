import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { getUserData, updateUserData } from "../services/api";
import withRefresh from "./withRefresh";

const Status = forwardRef((props, ref) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const data = await getUserData(userId);
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchUserData,
  }));

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLevelUp = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId && userData) {
        const updatedData = {
          ...userData,
          level: userData.level + 1,
        };
        await updateUserData(userId, updatedData);
        setUserData(updatedData);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  if (!userData) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4" data-testid="status-component">
      {isLoading && <p>Refreshing...</p>}
      <h2 className="text-2xl font-bold mb-4">Status</h2>
      <p>Level: {userData.level}</p>
      <p>Experience: {userData.experience}</p>
      <button
        onClick={handleLevelUp}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Level Up
      </button>
    </div>
  );
});

export default withRefresh(Status);
