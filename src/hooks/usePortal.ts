import { useEffect, useState } from "react";

export default function usePortal(id: string = "modal-root") {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(id);
    let created = false;

    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
      created = true;
    }

    setPortalElement(el);

    return () => {
      if (created && el?.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, [id]);

  return portalElement;
}
