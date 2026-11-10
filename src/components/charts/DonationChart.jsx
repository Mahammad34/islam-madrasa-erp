import {
    Pie,
    PieChart,
    Tooltip
} from "recharts";

function DonationChart() {

  const data = [
    { name: "Jan", value: 10000 },
    { name: "Feb", value: 15000 },
    { name: "Mar", value: 20000 }
  ];

  return (
    <div>

      <h2>❤️ Donation Chart</h2>

      <PieChart width={400} height={300}>

        <Pie
          data={data}
          dataKey="value"
          outerRadius={100}
        />

        <Tooltip />

      </PieChart>

    </div>
  );
}

export default DonationChart;