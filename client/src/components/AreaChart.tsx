import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", value: 40 },
  { name: "Tue", value: 30 },
  { name: "Wed", value: 20 },
  { name: "Thu", value: 27 },
  { name: "Fri", value: 18 },
  { name: "Sat", value: 23 },
  { name: "Sun", value: 34 },
];

export default function AreaChartComponent() {
  return (
    <div className="w-full h-64 bg-[#FFEEF0] p-4 rounded-2xl shadow">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="name" stroke="#A30000" />
          <YAxis stroke="#A30000" />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#A30000" 
            fill="#A30000" 
            fillOpacity={0.3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
