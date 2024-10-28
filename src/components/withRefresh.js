import React, { useCallback, useRef, useEffect } from "react";
import Layout from "./Layout";

const withRefresh = (WrappedComponent, refreshFunction) => {
  return (props) => {
    const componentRef = useRef(null);

    useEffect(() => {
      if (componentRef.current && refreshFunction) {
        componentRef.current.refresh = refreshFunction;
      }
    }, [refreshFunction]);

    const handleRefresh = useCallback(() => {
      if (componentRef.current && componentRef.current.refresh) {
        componentRef.current.refresh();
      }
    }, []);

    return (
      <Layout onRefresh={handleRefresh}>
        <WrappedComponent ref={componentRef} {...props} />
      </Layout>
    );
  };
};

export default withRefresh;
