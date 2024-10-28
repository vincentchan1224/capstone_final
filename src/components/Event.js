import React, { forwardRef } from "react";
import withRefresh from "./withRefresh";

const Event = forwardRef((props, ref) => {
  return (
    <div>
      <h2>Event</h2>
      {/* Add event-related content here */}
    </div>
  );
});

export default withRefresh(Event);
