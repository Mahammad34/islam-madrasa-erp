import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

function IncomeChart() {

  const data = [
    { month: "Jan", income: 50000 },
    { month: "Feb", income: 65000 },
    { month: "Mar", income: 80000 },
    { month: "Apr", income: 70000 }
  ];

  return (
    <div>

      <h2>📈 Income Chart</h2>

      <LineChart
        width={600}
        height={300}
        data={data}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="month" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="income"
        />

      </LineChart>

    </div>
  );
}

export default IncomeChart;