import { Camera, Upload } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { formatDate, todayKey } from '../utils/date.js';

export function Photos({ photos, addPhoto }) {
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState('');

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!preview) return;
    addPhoto({ id: crypto.randomUUID(), src: preview, note, date: todayKey() });
    setNote('');
    setPreview('');
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-amberFit">Fotos</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Galeria de evolução</h1>
      </div>

      <form onSubmit={handleSubmit} className="card grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.85fr_1fr]">
        <label className="grid min-h-56 cursor-pointer place-items-center rounded-lg border border-dashed border-line bg-ink p-4 text-center transition hover:border-cyanFit">
          {preview ? (
            <img src={preview} alt="Prévia da foto" className="max-h-72 rounded-lg object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-3 text-slate-300">
              <Upload size={30} className="text-cyanFit" />
              <span className="font-bold">Selecionar foto</span>
            </span>
          )}
          <input className="sr-only" type="file" accept="image/*" onChange={handleFile} />
        </label>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="photo-note">Observação opcional</label>
            <textarea
              id="photo-note"
              className="field min-h-32 resize-y"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Frente, lado, costas, luz, sensação do dia..."
            />
          </div>
          <button type="submit" disabled={!preview} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amberFit px-4 font-black text-ink transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50">
            <Camera size={20} />
            Salvar foto
          </button>
        </div>
      </form>

      {photos.length === 0 ? (
        <EmptyState title="Galeria vazia" text="As fotos ficam salvas no armazenamento local do navegador." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...photos].reverse().map((photo) => (
            <article key={photo.id} className="card overflow-hidden">
              <img src={photo.src} alt={`Evolução de ${formatDate(photo.date)}`} className="aspect-[4/5] w-full object-cover" />
              <div className="p-4">
                <p className="font-black text-white">{formatDate(photo.date)}</p>
                {photo.note && <p className="mt-1 text-sm text-slate-400">{photo.note}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
