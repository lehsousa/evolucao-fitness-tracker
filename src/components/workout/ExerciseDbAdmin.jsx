import { useEffect, useMemo, useState } from 'react';
import { Database, Link2, Loader2, Search, Trash2, Eye } from 'lucide-react';
import { exerciseLibrary } from '../../data/exercises.js';
import { isExerciseDbConfigured, searchExercisesByName } from '../../services/exerciseDbApi.js';
import { getExerciseSearchTerms, normalizeSearchText } from '../../data/exerciseSearchTerms.js';

export function ExerciseDbAdmin({ mappings, onSaveMapping, onRemoveMapping, onOpenDetail }) {
  const [localExerciseId, setLocalExerciseId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const configured = isExerciseDbConfigured();

  const selectedLocal = useMemo(
    () => exerciseLibrary.find((exercise) => exercise.id === localExerciseId),
    [localExerciseId],
  );

  const suggestedTerms = useMemo(
    () => getExerciseSearchTerms(localExerciseId),
    [localExerciseId]
  );

  // Initialize with first exercise
  useEffect(() => {
    if (exerciseLibrary.length > 0 && !localExerciseId) {
      selectLocal(exerciseLibrary[0].id);
    }
  }, [localExerciseId]);

  async function search(event) {
    if (event) event.preventDefault();
    if (!query.trim() && !suggestedTerms.length) return;

    setError('');
    setSuccessMsg('');
    setLoading(true);
    setResults([]);

    try {
      // Determinar a fila de termos a buscar
      const normalizedQuery = normalizeSearchText(query);
      const normalizedLocalName = normalizeSearchText(selectedLocal?.name || '');
      
      let termsToTry = [query];
      
      // Se o usuário clicou em buscar com o nome local em português (ou vazio, o que não devia acontecer),
      // e existem termos sugeridos, tentar a fila inteira.
      // Se o usuário digitou exatamente um dos termos sugeridos, usar ele e o restante da fila.
      if (normalizedQuery === normalizedLocalName || suggestedTerms.includes(query)) {
        const startIndex = suggestedTerms.indexOf(query);
        if (startIndex >= 0) {
          termsToTry = suggestedTerms.slice(startIndex);
        } else {
          termsToTry = [...suggestedTerms];
        }
      }

      let allFound = [];
      let lastApiError = null;

      for (const term of termsToTry) {
        if (!term) continue;
        setCurrentSearchTerm(term);
        
        try {
          const found = await searchExercisesByName(term);
          if (found && found.length > 0) {
            allFound = found;
            break; // Se achou algo, para e exibe (economia de API)
          }
        } catch (apiError) {
          lastApiError = apiError;
          break; // Se deu erro de limite/key, para tudo.
        }
      }

      if (allFound.length > 0) {
        // Garantir unicidade caso fossem combinados (mesmo parando no 1º, é boa prática)
        const uniqueResults = Array.from(new Map(allFound.map(item => [item.externalId, item])).values());
        setResults(uniqueResults.slice(0, 8));
      } else {
        if (lastApiError) {
          throw lastApiError;
        }
        setError('Nenhum exercício encontrado na ExerciseDB para esta busca.');
      }
    } catch (apiError) {
      setResults([]);
      setError(apiError.message || 'Não foi possível buscar na ExerciseDB agora. Verifique a chave da API ou tente novamente.');
    } finally {
      setLoading(false);
      setCurrentSearchTerm('');
    }
  }

  function selectLocal(id) {
    setLocalExerciseId(id);
    const terms = getExerciseSearchTerms(id);
    const exercise = exerciseLibrary.find((item) => item.id === id);
    
    // Se tiver tradução, preenche com o 1º termo. Senão, usa o nome padrão.
    setQuery(terms.length > 0 ? terms[0] : (exercise?.name || ''));
    setResults([]);
    setError('');
    setSuccessMsg('');
    setCurrentSearchTerm('');
  }

  function handleMap(result) {
    onSaveMapping(localExerciseId, result);
    setSuccessMsg('Exercício mapeado com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function handleChipClick(term) {
    setQuery(term);
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
            Conecte um exercício local a um exercício externo para exibir GIFs no detalhe.
          </p>
        </div>
        <span className={`rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-wide ${
          configured ? 'border-mint/30 bg-mint/10 text-mint' : 'border-amberFit/30 bg-amberFit/10 text-amberFit'
        }`}>
          {configured ? 'API configurada' : 'API não configurada'}
        </span>
      </div>

      {!configured && (
        <div className="mt-4 rounded-lg border border-amberFit/30 bg-amberFit/10 p-3 text-sm font-semibold text-amberFit space-y-2">
          <p>Para buscar novos GIFs, crie um arquivo <code>.env</code> na raiz do projeto com as chaves:</p>
          <pre className="text-xs bg-ink p-2 rounded text-slate-300 overflow-x-auto">
VITE_EXERCISEDB_API_KEY=sua_chave_aqui
VITE_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
          </pre>
        </div>
      )}

      {successMsg && (
        <p className="mt-4 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm font-bold text-mint">
          {successMsg}
        </p>
      )}

      <form onSubmit={search} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="label" htmlFor="local-exercise">Exercício local</label>
          <select id="local-exercise" className="field" value={localExerciseId} onChange={(event) => selectLocal(event.target.value)}>
            {exerciseLibrary.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} {mappings[exercise.id] ? '(Mapeado)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="exercise-db-query">Busca na ExerciseDB</label>
          <input id="exercise-db-query" className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex: bench press, lat pulldown..." />
          {suggestedTerms.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-bold text-slate-500 mb-1.5">Termos sugeridos:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTerms.map(term => (
                  <button 
                    key={term} 
                    type="button" 
                    onClick={() => handleChipClick(term)}
                    className={`px-2 py-1 text-xs font-semibold rounded-md transition ${query === term ? 'bg-cyanFit/20 text-cyanFit border border-cyanFit/30' : 'bg-ink border border-line text-slate-400 hover:text-white'}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !configured}
          className="flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-cyanFit px-4 font-black text-ink transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 mt-6"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          Buscar
        </button>
      </form>

      {loading && currentSearchTerm && (
        <p className="mt-2 text-xs font-semibold text-cyanFit animate-pulse">
          Buscando na ExerciseDB por: {currentSearchTerm}...
        </p>
      )}

      {error && <p className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error}</p>}

      {results.length > 0 && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {results.map((result) => (
            <article key={result.externalId} className="rounded-lg border border-line bg-ink p-3">
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
                  <p className="mt-1 text-xs font-bold text-cyanFit">Fonte: {result.provider || 'ExerciseDB'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleMap(result)}
                className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-mint px-3 text-sm font-black text-ink transition hover:bg-green-300"
              >
                <Link2 size={17} />
                Mapear este exercício
              </button>
            </article>
          ))}
        </div>
      )}

      {Object.keys(mappings).length > 0 && (
        <div className="mt-5 pt-5 border-t border-line">
          <h3 className="text-lg font-black text-white">Exercícios mapeados</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {Object.entries(mappings).map(([localId, mapping]) => {
              const localExercise = exerciseLibrary.find((exercise) => exercise.id === localId);
              return (
                <div key={localId} className="flex gap-3 rounded-lg bg-ink px-3 py-3 items-start border border-line/50">
                  {mapping.gifUrl ? (
                    <img src={mapping.gifUrl} alt={mapping.name} className="h-16 w-16 shrink-0 rounded-lg object-cover bg-black" />
                  ) : (
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-panelSoft text-slate-500">
                      <Database size={20} />
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-white leading-tight">{localExercise?.name || localId}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{mapping.name}</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-cyanFit">{mapping.provider || 'ExerciseDB'}</p>
                    
                    <div className="mt-3 flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => onOpenDetail && onOpenDetail(localId)} 
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-panelSoft text-xs font-bold text-white transition hover:bg-panel"
                      >
                        <Eye size={14} /> Ver no detalhe
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onRemoveMapping(localId)} 
                        className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-coral/10 text-coral transition hover:bg-coral/20"
                        title="Remover mapeamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
