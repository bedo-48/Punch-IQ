import FighterSearch from './FighterSearch';
import type { Fighter, FighterMatch } from '../types';


interface FighterCardProps {
  label: string;
  fighter: Fighter;
  onChange: (fighter: Fighter) => void;
}


export default function FighterCard({ label, fighter, onChange }: FighterCardProps) {

  // Quand l'utilisateur sélectionne un boxeur dans l'autocomplete :
  // on pré-remplit le form avec les stats du CSV (weight reste null car absent du CSV).
  function handleSelect(match: FighterMatch) {
    onChange({
      name: match.name,
      age: match.age,
      height: match.height,
      weight: null,                  // pas dans fighters.csv → user doit le rentrer
      won: match.won,
      lost: match.lost,
      drawn: match.drawn,
      kos: match.kos,
    });
  }

  // Met à jour un seul champ sans toucher les autres.
  function handleField<K extends keyof Fighter>(field: K, value: Fighter[K]) {
    onChange({ ...fighter, [field]: value });
  }

  return (
    <div className="space-y-3">
      <FighterSearch label={label} onSelect={handleSelect} />

      <div className="grid grid-cols-2 gap-3 pt-2">
        <NumberField label="Age"          value={fighter.age}    onChange={(v) => handleField('age', v)} />
        <NumberField label="Height (cm)"  value={fighter.height} onChange={(v) => handleField('height', v)} />
        <NumberField label="Weight (kg)"  value={fighter.weight} onChange={(v) => handleField('weight', v)} />
        <NumberField label="KOs"          value={fighter.kos}    onChange={(v) => handleField('kos', v)} />
        <NumberField label="Wins"         value={fighter.won}    onChange={(v) => handleField('won', v)} />
        <NumberField label="Losses"       value={fighter.lost}   onChange={(v) => handleField('lost', v)} />
        <NumberField label="Draws"        value={fighter.drawn}  onChange={(v) => handleField('drawn', v)} />
      </div>
    </div>
  );
}


// Helper sub-component : un input numérique avec label, qui gère null ↔ string vide.
interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') return onChange(null);
          const n = parseFloat(v);
          onChange(isNaN(n) ? null : n);
        }}
        className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
      />
    </label>
  );
}