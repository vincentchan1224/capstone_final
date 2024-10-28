import React, { useCallback } from "react";
import withRefresh from "./withRefresh";

const NewPage = () => {
  const fetchData = useCallback(() => {
    // Add your data fetching logic here
  }, []);

  return (
    <div>
      <h2>New Page</h2>
      {/* Add page content here */}
    </div>
  );
};

export default withRefresh(NewPage, () => {
  const component = new NewPage({});
  component.fetchData();
});
