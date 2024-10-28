import React, { forwardRef } from "react";
import withRefresh from "./withRefresh";

const Profile = forwardRef((props, ref) => {
  return (
    <div>
      <h2>Profile</h2>
      {/* Add profile-related content here */}
    </div>
  );
});

export default withRefresh(Profile);
