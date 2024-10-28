import React, { forwardRef } from "react";
import withRefresh from "./withRefresh";

const Mailbox = forwardRef((props, ref) => {
  return (
    <div>
      <h2>Mailbox</h2>
      {/* Add mailbox-related content here */}
    </div>
  );
});

export default withRefresh(Mailbox);
