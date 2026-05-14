import { useEffect, useMemo, useState } from 'react';
import Loading from 'react-fullscreen-loading';
import { UIContext } from '../hook/useUI';
import { Spin } from 'antd';

function UIProvider({ children, type, color }) {
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const params = useMemo(() => {
    return { loading, setLoading };
  }, [loading]);
  return (
    <div>
      {loading ? (
        <UIContext.Provider value={params}>
          {children}
          {/* <Loading loading={loadingPage} loaderColor="#FFFF00" /> */}
          {loading && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
              <Spin size="large" />
            </div>
          )}
        </UIContext.Provider>
      ) : (
        <UIContext.Provider value={params}>{children}</UIContext.Provider>
      )}
    </div>
  );
}

export default UIProvider;
