import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Link } from "react-router-dom";
import { getUserData } from "../services/api";
import withRefresh from "./withRefresh";

const MainPage = forwardRef((props, ref) => {
  const [userData, setUserData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const data = await getUserData(userId);
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchUserData,
  }));

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div
      className={`grid gap-4 ${isRefreshing ? "bg-yellow-100" : ""}`}
      data-testid="main-page"
    >
      {[
        "Status",
        "Keeper",
        "My Guild",
        "Event",
        "Asset",
        "Boss",
        "Explore",
      ].map((item) => (
        <Link
          key={item}
          to={`/${item.toLowerCase().replace(" ", "")}`}
          className="bg-white p-4 rounded shadow text-center"
        >
          {item}
        </Link>
      ))}
    </div>
  );
});

export default withRefresh(MainPage);
