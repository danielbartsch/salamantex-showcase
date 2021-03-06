import * as React from "react"
import { CrossIcon } from "./CrossIcon"

export const Modal = ({
  title,
  children,
  onClose,
}: {
  title: React.ReactNode
  children: React.ReactNode
  onClose?: () => void
}) => {
  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.()
      }
    }
    document.addEventListener("keyup", closeOnEscape)
    return () => {
      document.removeEventListener("keyup", closeOnEscape)
    }
  })
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "75%",
          minWidth: 500,
          maxWidth: 800,
          height: "50%",
          minHeight: 300,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          padding: "2em",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: "1.33em",
            marginBottom: "0.5em",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>{title}</div>
          <button onClick={onClose} style={{ border: "none" }}>
            <CrossIcon color="#222" />
          </button>
        </div>
        <div style={{ overflowY: "auto", flexGrow: 1 }}>{children}</div>
      </div>
    </>
  )
}
