import React from "react";
import withRefresh from "./withRefresh";

const Explore = () => {
  return (
    <div>
      <h2>Explore</h2>
      {/* Add explore-related content here */}
    </div>
  );
};

export default withRefresh(Explore, () => {
  console.log("Refreshing Explore page");
  // Add any specific refresh logic for Explore page
});
