// components/footer-context.tsx
"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type FooterState = {
  visible: boolean;
  attribution: ReactNode | null;
};

type FooterCtx = FooterState & {
  setVisible: (v: boolean) => void;
  setAttribution: (n: ReactNode | null) => void;
  reset: () => void;
};

const defaultState: FooterState = { visible: true, attribution: null };
const FooterContext = createContext<FooterCtx>({
  ...defaultState,
  setVisible: () => {},
  setAttribution: () => {},
  reset: () => {},
});

export function FooterProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(defaultState.visible);
  const [attribution, setAttribution] = useState<ReactNode | null>(defaultState.attribution);

  const value = useMemo(
    () => ({
      visible,
      attribution,
      setVisible,
      setAttribution,
      reset: () => {
        setVisible(true);
        setAttribution(null);
      },
    }),
    [visible, attribution]
  );

  return <FooterContext.Provider value={value}>{children}</FooterContext.Provider>;
}

export function useFooter() {
  return useContext(FooterContext);
}