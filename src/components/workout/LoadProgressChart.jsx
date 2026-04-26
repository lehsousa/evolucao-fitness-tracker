import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '../../utils/date.js';

export function LoadProgressChart({ history }) {
  const data = [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({ ...entry, label: formatDate(entry.date).slice(0, 5), weight: Number(entry.weight) || 0 }));

  return (
    <section className="card bg-panelSoft p-4 shadow-none">
      <h3 className="text-lg font-black text-white">Gráfico de evolução da carga</h3>
      <div className="mt-4 h-56">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#171d23', border: '1px solid #2e3844', borderRadius: 8, color: '#fff' }}
                formatter={(value, name, props) => [`${value} kg | ${props.payload.sets}x ${props.payload.reps}`, 'Carga']}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, fill: '#fbbf24' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-lg border border-dashed border-line bg-ink/45 px-4 text-center">
            <p className="text-sm font-semibold text-slate-500">Nenhuma carga registrada ainda. Registre sua primeira carga para acompanhar evolução.</p>
          </div>
        )}
      </div>
    </section>
  );
}
