"use client";
import { useEffect, useState } from "react";

type Expense = {
  id?: string;
  date: string;
  description: string;
  category: string;
  amount: number;
};

export default function ExpenseList({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/sheets/read", { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rows");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const parsed: Expense[] = (data.rows || []).map((r: any) => ({
          date: r[0] || "",
          description: r[1] || "",
          category: r[2] || "",
          amount: parseFloat(r[3]) || 0,
        }));
        setRows(parsed);
      })
      .catch((err) => setError(err.message || "Error"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) return <div className="p-4">Loading expenses...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (rows.length === 0)
    return <div className="p-4 text-gray-600">No expenses yet.</div>;

  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="text-left">
            <th className="p-2">Date</th>
            <th className="p-2">Description</th>
            <th className="p-2">Category</th>
            <th className="p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2">{r.category}</td>
              <td className="p-2 text-right">${r.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="border-t font-semibold">
            <td className="p-2" />
            <td className="p-2">Total</td>
            <td className="p-2" />
            <td className="p-2 text-right">{total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
