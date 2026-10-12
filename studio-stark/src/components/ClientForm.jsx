import { useState } from "react";
import { mascaraTelefone, soDigitos } from "../lib/format.js";

export function validarCliente({ nome, whatsapp, email }) {
  const erros = {};
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) erros.nome = "Digite nome e sobrenome.";
  const tel = soDigitos(whatsapp);
  if (tel.length < 10 || tel.length > 11) erros.whatsapp = "Digite o WhatsApp com DDD.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) erros.email = "Digite um e-mail válido.";
  return erros;
}

export const normalizarCliente = ({ nome, whatsapp, email }) => ({
  nome: nome.trim().replace(/\s+/g, " "),
  whatsapp: soDigitos(whatsapp),
  email: email.trim().toLowerCase(),
});

/* Formulário controlado — o estado mora no componente pai para que o botão de
   confirmar da barra inferior possa validar e enviar. */
export function useClientForm(inicial) {
  const [valores, setValores] = useState({
    nome: inicial?.nome ?? "",
    whatsapp: inicial ? mascaraTelefone(inicial.whatsapp) : "",
    email: inicial?.email ?? "",
  });
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);
  const erros = validarCliente(valores);
  const valido = Object.keys(erros).length === 0;
  return { valores, setValores, tocados, setTocados, enviado, setEnviado, erros, valido };
}

export default function ClientForm({ form, idPrefix = "cli" }) {
  const { valores, setValores, tocados, setTocados, enviado, erros } = form;
  const mostrar = (k) => (enviado || tocados[k]) && erros[k];
  const campo = (k, props) => (
    <label className="field" data-invalid={!!mostrar(k)} htmlFor={`${idPrefix}-${k}`}>
      <span className="field-label">{props.label}</span>
      <input
        id={`${idPrefix}-${k}`}
        value={valores[k]}
        onChange={(e) => setValores((v) => ({ ...v, [k]: props.mask ? props.mask(e.target.value) : e.target.value }))}
        onBlur={() => setTocados((t) => ({ ...t, [k]: true }))}
        aria-invalid={!!mostrar(k)}
        aria-describedby={mostrar(k) ? `${idPrefix}-${k}-erro` : undefined}
        {...props.input}
      />
      {mostrar(k) && <div className="field-error" id={`${idPrefix}-${k}-erro`}>{erros[k]}</div>}
    </label>
  );
  return (
    <div className="group">
      {campo("nome", { label: "Nome e sobrenome", input: { autoComplete: "name", placeholder: "Ex.: Lucas Almeida", autoCapitalize: "words", enterKeyHint: "next" } })}
      {campo("whatsapp", { label: "WhatsApp", mask: mascaraTelefone, input: { type: "tel", inputMode: "tel", autoComplete: "tel-national", placeholder: "(00) 00000-0000", enterKeyHint: "next" } })}
      {campo("email", { label: "E-mail", input: { type: "email", inputMode: "email", autoComplete: "email", placeholder: "voce@email.com", autoCapitalize: "off", spellCheck: false, enterKeyHint: "done" } })}
    </div>
  );
}
