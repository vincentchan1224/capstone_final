import React, { forwardRef } from "react";
import withRefresh from "./withRefresh";

const Friends = forwardRef((props, ref) => {
  return (
    <div>
      <h2>Friends</h2>
      {/* Add friends-related content here */}
    </div>
  );
});

export default withRefresh(Friends);
