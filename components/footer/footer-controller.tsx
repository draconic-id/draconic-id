// components/FooterController.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useFooter } from "./footer-context";

type Props =
  | { visible: false; attribution?: never }
  | { visible?: true; attribution?: ReactNode };

export default function FooterController(props: Props) {
  const { setVisible, setAttribution, reset } = useFooter();

  useEffect(() => {
    if (props.visible === false) {
      setVisible(false);
      setAttribution(null);
    } else {
      setVisible(true);
      setAttribution(props.attribution ?? null);
    }
    return () => reset(); // restore defaults on route change/unmount
  }, [props.visible, props.attribution, reset, setAttribution, setVisible]);

  return null;
}