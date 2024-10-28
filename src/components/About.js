import React, { forwardRef } from "react";
import withRefresh from "./withRefresh";

const About = forwardRef((props, ref) => {
  return (
    <div>
      <h2>About</h2>
      {/* Add about-related content here */}
    </div>
  );
});

export default withRefresh(About);
