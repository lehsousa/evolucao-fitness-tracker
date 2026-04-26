import { useMemo, useState } from 'react';
import { Database, Link2, Loader2, Search, Trash2 } from 'lucide-react';
import { exerciseLibrary } from '../../data/exercises.js';
import { hasExerciseDbConfig, searchExercisesByName } from '../../services/exerciseDbApi.js';

export function ExerciseDbAdmin({ mappings, onSaveMapping, onRemoveMapping }) {
  const [localExerciseId, setLocalExerciseId] = useState(exerciseLibrary[0]?.id || '');
  const [query, setQuery] = useState(exerciseLibrary[0]?.name || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const configured = hasExerciseDbConfig();

  const selectedLocal = useMemo(
    () => exerciseLibrary.find((exercise) => exercise.id === localExerciseId),
    [localExerciseId],
  );

  async function search(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const found = await searchExercisesByName(query || selectedLocal?.name);
      setResults(found.slice(0, 8));
      if (!found.length) setError('Nenhum exercício encontrado na ExerciseDB para esta busca.');
    } catch (apiError) {
      setResults([]);
      setError(apiError.message || 'Não foi possível buscar na ExerciseDB agora.');
    } finally {
      setLoading(false);
    }
  }

  function selectLocal(id) {
    const exercise = exerciseLibrary.find((item) => item.id === id);
    setLocalExerciseId(id);
    setQuery(exercise?.name || '');
    setResults([]);
    setError('');
  }

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-cyanFit">
            <Database size={18} />
            Administração de GIFs
          </p>
          <h2 className="mt-1 text-xl font-black text-white">Mapeamento ExerciseDB</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Conecte um exercício local a um exercício externo para exibir GIFs no detalhe. Fonte: ExerciseDB.
          </p>
        </div>
        <span className={`rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-wide ${
          configured ? 'border-mint/30 bg-mint/10 text-mint' : 'border-amberFit/30 bg-amberFit/10 text-amberFit'
        }`}>
          {configured ? 'API configurada' : 'API não configurada'}
        </span>
      </div>

      {!configured && (
        <p className="mt-4 rounded-lg border border-amberFit/30 bg-amberFit/10 px-3 py-2 text-sm font-semibold text-amberFit">
          Configure `VITE_EXERCISEDB_API_KEY` no ambiente para buscar GIFs. Sem isso, o app mantém o placeholder.
        </p>
      )}

      <form onSubmit={search} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="label" htmlFor="local-exercise">Exercício local</label>
          <select id="local-exercise" className="field" value={localExerciseId} onChange={(event) => selectLocal(event.target.value)}>
            {exerciseLibrary.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="exercise-db-query">Busca na ExerciseDB</label>
          <input id="exercise-db-query" className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="bench press, lat pulldown..." />
        </div>
        <button
          type="submit"
          disabled={loading || !configured}
          className="flex min-h-12 items-center justify-center gap-2 self-end rounded-lg bg-cyanFit px-4 font-black text-ink transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          Buscar
        </button>
      </form>

      {error && <p className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error}</p>}

      {results.length > 0 && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {results.map((result) => (
            <article key={result.id} className="rounded-lg border border-line bg-ink p-3">
              <div className="flex gap-3">
                {result.gifUrl ? (
                  <img src={result.gifUrl} alt={`ExerciseDB: ${result.name}`} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-panelSoft text-slate-500">
                    <Database size={24} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white">{result.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{result.bodyPart || '--'} • {result.target || '--'} • {result.equipment || '--'}</p>
                  <p className="mt-1 text-xs font-bold text-cyanFit">Fonte: ExerciseDB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSaveMapping(localExerciseId, result)}
                className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-mint px-3 text-sm font-black text-ink transition hover:bg-green-300"
              >
                <Link2 size={17} />
                Mapear para {selectedLocal?.name}
              </button>
            </article>
          ))}
        </div>
      )}

      {Object.keys(mappings).length > 0 && (
        <div className="mt-5">
          <h3 className="text-lg font-black text-white">Mapeamentos salvos</h3>
          <div className="mt-3 grid gap-2">
            {Object.entries(mappings).map(([localId, mapping]) => {
              const localExercise = exerciseLibrary.find((exercise) => exercise.id === localId);
              return (
                <div key={localId} className="flex items-center justify-between gap-3 rounded-lg bg-ink px-3 py-3">
                  <div className="min-w-0">
                    <p className="font-black text-white">{localExercise?.name || localId}</p>
                    <p className="mt-1 truncate text-sm text-slate-400">{mapping.name} • Fonte: ExerciseDB</p>
                  </div>
                  <button type="button" onClick={() => onRemoveMapping(localId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-coral/10 text-coral transition hover:bg-coral/20">
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
