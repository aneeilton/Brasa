import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "./Icons.jsx";

/* Barra superior translúcida; ganha separador quando a página rola. */
export function TopBar({ title, onBack, backLabel = "Voltar", end }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className="topbar" data-scrolled={scrolled}>
      <div className="topbar-inner">
        <div>
          {onBack && (
            <button className="link-btn" onClick={onBack}>
              <ChevronLeft />
              {backLabel}
            </button>
          )}
        </div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-end">{end}</div>
      </div>
    </header>
  );
}

/* Título da tela: recebe o foco quando a tela muda, para leitores de tela anunciarem a nova etapa. */
export function ScreenTitle({ children, sub }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <>
      <h1 className="large-title" tabIndex={-1} ref={ref} style={{ outline: "none" }}>{children}</h1>
      {sub && <p className="subhead">{sub}</p>}
    </>
  );
}

export function Progress({ step, total }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Etapa ${step} de ${total}`}>
      {Array.from({ length: total }, (_, i) => <span key={i} data-on={i < step} />)}
    </div>
  );
}

export function ActionBar({ children, summary, detail }) {
  return (
    <div className="actionbar">
      <div className="actionbar-inner">
        {(summary || detail) && (
          <div className="actionbar-summary" aria-live="polite">
            {summary && <strong>{summary}</strong>}
            {detail && <div>{detail}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* Diálogo de confirmação com <dialog> nativo (foco preso e Esc já resolvidos pelo navegador). */
export function Confirm({ open, title, message, confirmLabel, onConfirm, onCancel, destructive }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }} aria-labelledby="confirm-title">
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="stack">
        <button className={`btn btn-block ${destructive ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        <button className="btn btn-block btn-secondary" onClick={onCancel} autoFocus>Manter</button>
      </div>
    </dialog>
  );
}
