"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listWorkOrders } from "../../lib/api";

type WorkOrder = { id: string; numeroOs: number | null; status: string };

export default function DashboardPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    listWorkOrders(token).then(setOrders).catch((e: Error) => setError(e.message));
  }, []);

  const byStatus = orders.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="container">
      <h1>Dashboard</h1>
      <div className="card">
        <h2>Contadores por status</h2>
        <ul>
          {Object.entries(byStatus).map(([status, count]) => (
            <li key={status}>{status}: {count}</li>
          ))}
        </ul>
        <Link href="/work-orders">Ir para lista de OS</Link>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>
    </main>
  );
}
