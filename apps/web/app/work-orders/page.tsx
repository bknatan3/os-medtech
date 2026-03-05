"use client";

import { useEffect, useState } from "react";
import { listWorkOrders } from "../../lib/api";

type WorkOrder = {
  id: string;
  numeroOs: number | null;
  status: string;
  descricaoProblema?: string;
};

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    listWorkOrders(token).then(setOrders);
  }, []);

  return (
    <main className="container">
      <h1>Ordens de Servico</h1>
      <div className="card">
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Numero</th>
              <th>Status</th>
              <th>Problema</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((wo) => (
              <tr key={wo.id}>
                <td>{wo.numeroOs ?? "PENDENTE"}</td>
                <td>{wo.status}</td>
                <td>{wo.descricaoProblema ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
