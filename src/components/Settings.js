import React, { forwardRef } from "react";
import withRefresh from "./withRefresh";

const Settings = forwardRef((props, ref) => {
  return (
    <div>
      <h2>Settings</h2>
      {/* Add settings-related content here */}
    </div>
  );
});

export default withRefresh(Settings);
