"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AlertDialogState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: "danger" | "primary";
  onConfirm: () => void;
};

type AlertDialogContextType = {
  state: AlertDialogState;
  openAlert: (opts: Omit<AlertDialogState, "open">) => void;
  closeAlert: () => void;
};

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

export function useAlertDialog() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error("useAlertDialog must be inside AlertDialogProvider");
  return ctx;
}

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertDialogState>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "danger",
    onConfirm: () => {},
  });

  const openAlert = useCallback((opts: Omit<AlertDialogState, "open">) => {
    setState({ ...opts, open: true });
  }, []);

  const closeAlert = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <AlertDialogContext.Provider value={{ state, openAlert, closeAlert }}>
      {children}
      {state.open && (
        <div style={overlayStyle} onClick={closeAlert}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={titleStyle}>{state.title}</h3>
            <p style={descStyle}>{state.description}</p>
            <div style={footerStyle}>
              <button onClick={closeAlert} style={cancelBtnStyle}>{state.cancelLabel}</button>
              <button
                onClick={() => { state.onConfirm(); closeAlert(); }}
                style={state.variant === "danger" ? dangerBtnStyle : confirmBtnStyle}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertDialogContext.Provider>
  );
}

export { AlertDialogProvider as AlertDialog };

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 100,
  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const modalStyle: React.CSSProperties = {
  background: "var(--bg-surface, #0d0d0d)",
  border: "1px solid var(--border, #242728)",
  borderRadius: 14, padding: "24px 28px",
  maxWidth: 420, width: "90%",
};

const titleStyle: React.CSSProperties = {
  fontSize: 16, fontWeight: 600, color: "#ffffff", margin: 0,
};

const descStyle: React.CSSProperties = {
  fontSize: 13, color: "var(--text-muted, #9c9c9d)", marginTop: 8, lineHeight: 1.5,
};

const footerStyle: React.CSSProperties = {
  display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20,
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8,
  background: "transparent", border: "1px solid var(--border, #242728)",
  color: "var(--text-secondary, #cdcdcd)", cursor: "pointer",
};

const confirmBtnStyle: React.CSSProperties = {
  padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8,
  background: "#ffffff", border: "none", color: "#000000", cursor: "pointer",
};

const dangerBtnStyle: React.CSSProperties = {
  padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8,
  background: "#da3633", border: "none", color: "#ffffff", cursor: "pointer",
};
