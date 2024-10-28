import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { editKeeper, getKeeperDetails } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";

const EditKeeper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { keeperId } = useParams();
  const [keeper, setKeeper] = useState(location.state?.keeper || null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKeeper = async () => {
      if (!keeper && keeperId) {
        try {
          const fetchedKeeper = await getKeeperDetails(keeperId);
          setKeeper(fetchedKeeper);
        } catch (err) {
          console.error("Failed to fetch keeper details:", err);
          setError("Failed to load keeper details");
        }
      }
    };

    fetchKeeper();
  }, [keeper, keeperId]);

  const handleChange = (e) => {
    setKeeper({ ...keeper, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await editKeeper(keeper.id, keeper);
      navigate("/admin/view-keepers");
    } catch (error) {
      console.error("Error editing keeper:", error);
      setError("Failed to edit keeper. Please try again.");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!keeper) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Keeper</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true);
        }}
      >
        {Object.entries(keeper).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {key}:
            </label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Changes
        </button>
      </form>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Changes"
        message="Are you sure you want to save these changes?"
        onConfirm={handleSubmit}
      />
    </div>
  );
};

export default EditKeeper;
