import { useMemo, useState } from 'react';
import { UIContext } from '../hook/useUI';
import { Spin } from 'antd';

function UIProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const params = useMemo(() => {
    return { loading, setLoading };
  }, [loading]);
  return (
    <div>
      {loading ? (
        <UIContext.Provider value={params}>
          {children}
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
