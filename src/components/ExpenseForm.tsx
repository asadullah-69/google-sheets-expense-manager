"use client";
import { useState } from "react";

export default function ExpenseForm({ onAdded }: { onAdded: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!description.trim()) return setError("Description required");
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0)
      return setError("Amount must be a positive number");

    setLoading(true);
    try {
      const res = await fetch("/api/sheets/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          description,
          category,
          amount: amt,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to add expense");
      }

      // Success: clear form, tell parent to refresh
      setDescription("");
      setAmount("");
      setCategory("General");
      onAdded();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Network error");
      } else {
        setError("Network error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {/* Hidden labels for screen readers */}
      <div className="sr-only">
        <label htmlFor="expense-description">Expense description</label>
        <label htmlFor="expense-amount">Amount</label>
        <label htmlFor="expense-date">Date</label>
        <label htmlFor="expense-category">Category</label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          id="expense-description"
          className="border p-2 rounded col-span-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Expense description"
        />
        <input
          id="expense-amount"
          className="border p-2 rounded"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          aria-label="Amount"
        />
        <input
          id="expense-date"
          className="border p-2 rounded"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date"
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <select
          id="expense-category"
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Expense category"
        >
          <option>General</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Other</option>
        </select>

        <button
          type="submit"
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </div>
    </form>
  );
}
