import { useEffect, useState } from 'react';
import { Activity, Loader2, Play } from 'lucide-react';
import { getExerciseGif } from '../../services/exerciseDbApi.js';

export function ExerciseAnimationPlaceholder({ exercise, exerciseDbMapping }) {
  const [gifUrl, setGifUrl] = useState(exercise.animationUrl || exerciseDbMapping?.gifUrl || '');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);

    if (exercise.animationUrl) {
      setGifUrl(exercise.animationUrl);
      return undefined;
    }

    if (!exerciseDbMapping?.id) {
      setGifUrl('');
      return undefined;
    }

    if (exerciseDbMapping.gifUrl) {
      setGifUrl(exerciseDbMapping.gifUrl);
      return undefined;
    }

    setLoading(true);
    getExerciseGif(exerciseDbMapping.id)
      .then((url) => {
        if (!active) return;
        setGifUrl(url || '');
        setFailed(!url);
      })
      .catch(() => {
        if (!active) return;
        setGifUrl('');
        setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [exercise.animationUrl, exerciseDbMapping?.gifUrl, exerciseDbMapping?.id]);

  if (gifUrl) {
    return (
      <section className="card overflow-hidden bg-ink shadow-none">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <Play className="text-mint" size={19} />
            <h3 className="font-black text-white">Animação da execução</h3>
          </div>
          <span className="rounded-lg bg-cyanFit/10 px-2 py-1 text-xs font-bold text-cyanFit">Fonte: ExerciseDB</span>
        </div>
        <img src={gifUrl} alt={`Execução técnica: ${exercise.name}`} className="aspect-video w-full bg-black object-contain" />
      </section>
    );
  }

  return (
    <section className="card overflow-hidden bg-ink shadow-none">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Play className="text-mint" size={19} />
          <h3 className="font-black text-white">Animação da execução</h3>
        </div>
        <span className="rounded-lg bg-panelSoft px-2 py-1 text-xs font-bold text-cyanFit">visual técnico</span>
      </div>
      <div className="grid aspect-video place-items-center bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,#101418,#202831)] px-4 text-center">
        <div>
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-mint/40 bg-mint/10 text-mint">
            {loading ? <Loader2 className="animate-spin" size={30} /> : <Activity size={30} />}
          </div>
          <p className="font-black text-white">{exercise.name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-400">{exercise.muscleGroup}</p>
          <p className="mt-3 text-sm text-slate-500">
            {loading ? 'Buscando animação na ExerciseDB...' : 'Animação da execução será adicionada aqui.'}
          </p>
          {failed && <p className="mt-2 text-xs font-bold text-amberFit">Não foi possível carregar a ExerciseDB. Placeholder mantido.</p>}
        </div>
      </div>
    </section>
  );
}
