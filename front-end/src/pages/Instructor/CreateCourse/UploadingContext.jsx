import { createContext, useCallback, useContext, useState } from "react";

export const UploadingContext = createContext({
  count: 0,
  inc: () => {},
  dec: () => {},
});

export const useUploading = () => useContext(UploadingContext);

export const UploadingProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const inc = useCallback(() => setCount((c) => c + 1), []);
  const dec = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  return (
    <UploadingContext.Provider value={{ count, inc, dec }}>
      {children}
    </UploadingContext.Provider>
  );
};
