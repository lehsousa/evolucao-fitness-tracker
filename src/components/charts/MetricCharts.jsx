import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const tooltipStyle = {
  background: '#171d23',
  border: '1px solid #2e3844',
  borderRadius: 8,
  color: '#fff',
};

export function LineMetricChart({ title, suffix, dataKey, data, color }) {
  const chartData = data.filter((item) => Number.isFinite(item[dataKey]));

  return (
    <section className="card p-4">
      <h2 className="mb-4 text-lg font-black text-white sm:text-xl">{title}</h2>
      <div className="h-56 sm:h-64">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} ${suffix}`, title]} labelStyle={{ color: '#cbd5e1' }} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>
    </section>
  );
}

export function BarMetricChart({ title, suffix, dataKey, data, color }) {
  const chartData = data.filter((item) => Number.isFinite(item[dataKey]));

  return (
    <section className="card p-4">
      <h2 className="mb-4 text-lg font-black text-white sm:text-xl">{title}</h2>
      <div className="h-56 sm:h-64">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} ${suffix}`, title]} labelStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center rounded-lg border border-dashed border-line bg-ink/45 px-4 text-center">
      <p className="text-sm font-semibold text-slate-500">Sem dados suficientes</p>
    </div>
  );
}
