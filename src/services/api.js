import axios from "axios";

const API_URL = "http://localhost:5001/api";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to handle errors
const handleError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  throw error.response?.data || error;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    if (
      error.response &&
      error.response.data.error === "This account has been banned."
    ) {
      throw new Error("Your account has been banned. Please contact support.");
    }
    return handleError(error);
  }
};

export const registerUser = async (email, password, playerName) => {
  try {
    const response = await api.post("/register", {
      email,
      password,
      playerName,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getUserData = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateUserData = async (userId, userData) => {
  try {
    const response = await api.post(`/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const summonKeeper = async (userId, times) => {
  try {
    const response = await api.post(`/summon-keeper/${userId}`, { times });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getKeeperDetails = async (keeperId) => {
  try {
    const response = await api.get(`/keeper/${keeperId}`);
    const keeperData = response.data;

    // Fetch the keeper class information
    const classResponse = await api.get(`/keeper-class/${keeperData.class}`);
    const classData = classResponse.data;

    // Combine keeper data with class data
    return {
      ...keeperData,
      className: classData.name,
      description: classData.description,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getSummonRecords = async (userId) => {
  try {
    const response = await api.get(`/summon-records/${userId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getKeeperClass = async (classId) => {
  try {
    const response = await api.get(`/keeper-class/${classId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const adminLogin = async (email, password) => {
  try {
    const response = await api.post("/admin/login", { email, password });
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllKeepers = async () => {
  try {
    const response = await api.get("/admin/keepers");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const banKeeper = async (keeperId) => {
  try {
    const response = await api.post(`/admin/keeper/${keeperId}/toggle-ban`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editKeeper = async (keeperId, keeperData) => {
  try {
    const response = await api.post(
      `/admin/keeper/${keeperId}/edit`,
      keeperData
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editUser = async (userId, userData) => {
  try {
    const response = await api.post(`/admin/user/${userId}/edit`, userData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllBosses = async () => {
  try {
    const response = await api.get("/bosses");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editBoss = async (bossId, bossData) => {
  try {
    const response = await api.post(`/boss/${bossId}/edit`, bossData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const defeatBoss = async (bossId, userId, coinDrop, gemDrop) => {
  try {
    const response = await api.post(`/boss-defeat/${bossId}`, {
      userId,
      coinDrop,
      gemDrop,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Add more API functions as needed

export default api;
