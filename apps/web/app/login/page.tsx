"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl, login, setApiBaseUrl } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [senha, setSenha] = useState("senha123");
  const [erro, setErro] = useState("");
  const [apiBaseUrl, setApiBaseUrlState] = useState("http://localhost:3333");
  const [apiStatus, setApiStatus] = useState("");

  useEffect(() => {
    getApiBaseUrl().then((value) => setApiBaseUrlState(value));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      const data = await login(email, senha);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
    }
  }

  async function onSaveApi() {
    setApiStatus("");
    try {
      await setApiBaseUrl(apiBaseUrl);
      setApiStatus("API salva.");
    } catch {
      setApiStatus("Falha ao salvar API.");
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>OS MedTech</h1>
        <p>Login</p>
        <div style={{ marginBottom: 12 }}>
          <input
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrlState(e.target.value)}
            placeholder="URL da API"
          />
          <button type="button" onClick={onSaveApi}>
            Salvar API
          </button>
          {apiStatus && <p style={{ marginTop: 8 }}>{apiStatus}</p>}
        </div>
        <form onSubmit={onSubmit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" />
          <button type="submit">Entrar</button>
        </form>
        {erro && <p style={{ color: "crimson" }}>{erro}</p>}
      </div>
    </main>
  );
}
