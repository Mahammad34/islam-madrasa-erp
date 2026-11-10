import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function ExpenseChart() {

  const data = [
    { month: "Jan", expense: 25000 },
    { month: "Feb", expense: 30000 },
    { month: "Mar", expense: 40000 },
    { month: "Apr", expense: 35000 }
  ];

  return (
    <div>

      <h2>📉 Expense Chart</h2>

      <BarChart
        width={600}
        height={300}
        data={data}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="month" />

        <YAxis />

        <Tooltip />

        <Bar dataKey="expense" />

      </BarChart>

    </div>
  );
}

export default ExpenseChart;