import { ShoppingCart } from 'lucide-react';
import { shoppingListSections } from '../../data/foodOptions.js';

export function ShoppingList() {
  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 text-xl font-black text-white">
        <ShoppingCart className="text-cyanFit" size={22} />
        Lista de compras base
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {shoppingListSections.map((section) => (
          <div key={section.title} className="rounded-lg bg-ink px-3 py-3">
            <p className="font-black text-white">{section.title}</p>
            <ul className="mt-2 grid gap-1 text-sm font-semibold text-slate-300">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
