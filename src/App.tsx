import React, { useMemo, useState, useEffect } from "react";

type QuadrantKey = "Q1" | "Q2" | "Q3" | "Q4";

type Note = {
  id: string;
  q: QuadrantKey;
  title: string;
  body: string;
  color: string;
};

const STORAGE_KEY = "eisen_notes_v1";
const USER_KEY = "eisen_user_v1";
function storageKeyFor(userId: string) { return `${STORAGE_KEY}__${userId}`; }

const SAMPLE_NOTES: Note[] = [
  { id: "n1", q: "Q1", title: "Pagar contas", body: "Vencem hoje", color: "#FDE68A" },
  { id: "n2", q: "Q2", title: "Planejar semana", body: "Bloquear horários", color: "#A7F3D0" },
  { id: "n3", q: "Q3", title: "Responder e-mails", body: "30 min", color: "#BFDBFE" },
  { id: "n4", q: "Q4", title: "Reels ideias", body: "3 rascunhos", color: "#FCA5A5" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function LoginCard({ onLogin }: { onLogin: (id: string) => void }) {
  const [id, setId] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = id.trim();
    if (!v) return;
    onLogin(v);
  }
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="text-sm opacity-80">Use um e-mail ou ID para guardar sua matriz apenas para você neste dispositivo.</p>
        <input value={id} onChange={(e)=>setId(e.target.value)} placeholder="Seu e-mail ou ID" className="mt-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" className="mt-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Continuar</button>
      </form>
    </div>
  );
}

function Sticky({ id, title, body, color, onDelete, onDragStart, onEditStart }: { id: string; title: string; body: string; color: string; onDelete: (id: string) => void; onDragStart: (id: string, e: React.DragEvent) => void; onEditStart: (id: string) => void }) {
  const rotation = useMemo(() => (Math.random() * 4 - 2).toFixed(2), []);
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e)=> { setConfirming(false); onDragStart(id, e); }}
      className="relative w-44 min-h-28 p-3 shadow-md rounded-md border border-black/10 select-none cursor-grab active:cursor-grabbing"
      style={{ background: color, transform: `rotate(${rotation}deg)`, zIndex: confirming ? 50 : 1 }}
    >
      <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
        <button
          type="button"
          draggable={false}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditStart(id); }}
          className="h-6 w-6 grid place-items-center rounded-full bg-black text-white text-xs font-bold bg-opacity-20 hover:bg-opacity-40"
          title="Editar"
          aria-label="Editar"
        >✎</button>
        <button
          type="button"
          draggable={false}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true); }}
          className="h-6 w-6 grid place-items-center rounded-full bg-black text-white text-xs font-bold bg-opacity-20 hover:bg-opacity-40"
          title="Excluir"
          aria-label="Excluir"
        >×</button>
      </div>

      {confirming && (
        <div className="absolute -top-2 right-16 z-20 bg-white border border-black/10 rounded shadow p-2 flex items-center gap-2 text-xs">
          <span>Excluir?</span>
          <button type="button" className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => onDelete(id)}>Sim</button>
          <button type="button" className="px-2 py-1 rounded bg-gray-200" onClick={() => setConfirming(false)}>Não</button>
        </div>
      )}

      <div className="text-sm font-bold mb-1 leading-tight pr-10">{title}</div>
      <div className="text-xs leading-snug whitespace-pre-wrap break-words opacity-90">{body}</div>
    </div>
  );
}

function Quadrant({ qKey, label, notes, onDropTo, onDelete, onEditStart }: { qKey: QuadrantKey; label: string; notes: Note[]; onDropTo: (q: QuadrantKey, noteId: string) => void; onDelete: (id: string) => void; onEditStart: (id: string) => void }) {
  function handleDragStart(id: string, e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", id);
  }
  return (
    <div
      className="relative flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDropTo(qKey, id);
      }}
    >
      <SectionHeader title={label} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-min">
        {notes.map((n) => (
          <Sticky key={n.id} id={n.id} title={n.title} body={n.body} color={n.color} onDelete={onDelete} onDragStart={handleDragStart} onEditStart={onEditStart} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
    </div>
  );
}

function AddNoteForm({ onAdd, onUpdate, editingNote, onCancelEdit }: { onAdd: (note: { title: string; body: string; color: string; q: QuadrantKey }) => void; onUpdate: (id: string, data: { title: string; body: string; color: string; q: QuadrantKey }) => void; editingNote: Note | null; onCancelEdit: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState("#FDE68A");
  const [q, setQ] = useState<QuadrantKey>("Q1");

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setBody(editingNote.body);
      setColor(editingNote.color);
      setQ(editingNote.q);
    } else {
      setTitle("");
      setBody("");
      setColor("#FDE68A");
      setQ("Q1");
    }
  }, [editingNote]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingNote) {
      onUpdate(editingNote.id, { title: title.trim(), body, color, q });
      onCancelEdit();
    } else {
      onAdd({ title: title.trim(), body, color, q });
    }
  }

  const presets = [
    { hex: "#FDE68A", label: "Doméstico" },
    { hex: "#BFDBFE", label: "Trabalho" },
    { hex: "#A7F3D0", label: "Estudos" },
    { hex: "#FCA5A5", label: "Empresa" },
  ];

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{editingNote ? "Editar post-it" : "Novo post-it"}</div>
        {editingNote && (
          <button type="button" onClick={onCancelEdit} className="text-xs px-2 py-1 rounded bg-gray-200">Cancelar edição</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs font-medium">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex.: Pagar contas" />
        </div>
        <div>
          <label className="text-xs font-medium">Quadrante</label>
          <select value={q} onChange={(e) => setQ(e.target.value as QuadrantKey)} className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Q1">Q1 — Faça agora</option>
            <option value="Q2">Q2 — Planeje</option>
            <option value="Q3">Q3 — Delegue</option>
            <option value="Q4">Q4 — Elimine</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium">Cor</label>
          <div className="mt-1 flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 p-0 border border-gray-300 rounded" />
            <div className="flex gap-1 flex-wrap">
              {presets.map((p) => (
                <button type="button" key={p.hex} onClick={() => setColor(p.hex)} title={p.label} className="h-6 w-6 rounded border border-black/10" style={{ background: p.hex }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium">Descrição</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Detalhes da tarefa..." />
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">{editingNote ? "Salvar alterações" : "Adicionar Post-it"}</button>
      </div>
    </form>
  );
}

function ColumnHeader({ text, bg }: { text: string; bg: string }) {
  return (
    <div className="h-12 flex items-center justify-center rounded-md text-white font-semibold uppercase tracking-wide" style={{ background: bg }}>
      {text}
    </div>
  );
}

function RowLabel({ text, bg }: { text: string; bg: string }) {
  return (
    <div className="h-full w-16 md:w-20 rounded-md flex items-center justify-center text-white font-semibold uppercase tracking-wide" style={{ background: bg }}>
      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{text}</span>
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState<string>(() => {
    try { return localStorage.getItem(USER_KEY) || ""; } catch { return ""; }
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingNote = editingId ? notes.find(n => n.id === editingId) ?? null : null;

  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(storageKeyFor(userId));
      setNotes(raw ? (JSON.parse(raw) as Note[]) : SAMPLE_NOTES);
    } catch { setNotes(SAMPLE_NOTES); }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    try { localStorage.setItem(storageKeyFor(userId), JSON.stringify(notes)); } catch {}
  }, [notes, userId]);

  function handleAdd(note: { title: string; body: string; color: string; q: QuadrantKey }) {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    const newNote: Note = { id, ...note };
    setNotes((prev) => [newNote, ...prev]);
  }
  function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setEditingId(prev => prev === id ? null : prev);
  }
  function handleUpdate(id: string, data: { title: string; body: string; color: string; q: QuadrantKey }) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  }
  function handleDropTo(q: QuadrantKey, noteId: string) {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, q } : n)));
  }

  if (!userId) {
    return <LoginCard onLogin={(id)=>{ setUserId(id); try { localStorage.setItem(USER_KEY, id); } catch {} }} />;
  }

  const q1 = notes.filter((n) => n.q === "Q1");
  const q2 = notes.filter((n) => n.q === "Q2");
  const q3 = notes.filter((n) => n.q === "Q3");
  const q4 = notes.filter((n) => n.q === "Q4");

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 sm:p-6 lg:p-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Matriz de Eisenhower</h1>
          <p className="text-sm opacity-80">Arraste os post-its por qualquer área • Lápis para editar • X para excluir</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs" style={{background: "rgba(255,255,255,0.7)"}}>
            <ColorPill hex="#FDE68A" label="Doméstico" />
            <ColorPill hex="#BFDBFE" label="Trabalho" />
            <ColorPill hex="#A7F3D0" label="Estudos" />
            <ColorPill hex="#FCA5A5" label="Empresa" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white border">{userId}</span>
            <button className="px-2 py-1 rounded bg-zinc-200" onClick={()=>{ setUserId(""); try { localStorage.removeItem(USER_KEY); } catch {} }}>Trocar usuário</button>
          </div>
        </div>
      </header>

      <AddNoteForm onAdd={handleAdd} onUpdate={handleUpdate} editingNote={editingNote} onCancelEdit={()=>setEditingId(null)} />

      <main className="grid gap-4 lg:gap-6" style={{gridTemplateColumns: "72px 1fr 1fr", gridTemplateRows: "48px 1fr 1fr", display: "grid"}}>
        <div style={{gridColumnStart: 2, gridRowStart: 1}}>
          <ColumnHeader text="Urgente" bg="#7C3AED" />
        </div>
        <div style={{gridColumnStart: 3, gridRowStart: 1}}>
          <ColumnHeader text="Não Urgente" bg="#F59E0B" />
        </div>
        <div style={{gridColumnStart: 1, gridRowStart: 2}}>
          <RowLabel text="Importante" bg="#EC4899" />
        </div>
        <div style={{gridColumnStart: 1, gridRowStart: 3}}>
          <RowLabel text="Não Importante" bg="#1E40AF" />
        </div>
        <div style={{gridColumnStart: 2, gridRowStart: 2}}>
          <Quadrant qKey="Q1" label="Q1 — Faça agora" notes={q1} onDropTo={handleDropTo} onDelete={handleDelete} onEditStart={(id)=>setEditingId(id)} />
        </div>
        <div style={{gridColumnStart: 3, gridRowStart: 2}}>
          <Quadrant qKey="Q2" label="Q2 — Planeje" notes={q2} onDropTo={handleDropTo} onDelete={handleDelete} onEditStart={(id)=>setEditingId(id)} />
        </div>
        <div style={{gridColumnStart: 2, gridRowStart: 3}}>
          <Quadrant qKey="Q3" label="Q3 — Delegue" notes={q3} onDropTo={handleDropTo} onDelete={handleDelete} onEditStart={(id)=>setEditingId(id)} />
        </div>
        <div style={{gridColumnStart: 3, gridRowStart: 3}}>
          <Quadrant qKey="Q4" label="Q4 — Elimine" notes={q4} onDropTo={handleDropTo} onDelete={handleDelete} onEditStart={(id)=>setEditingId(id)} />
        </div>
      </main>

      <footer className="mt-6 text-xs opacity-70">
        <p>v3.1</p>
      </footer>
    </div>
  );
}

function ColorPill({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-black/5 shadow-sm" style={{background: "rgba(255,255,255,0.7)"}}>
      <span className="h-3 w-3 rounded-full inline-block border border-black/10" style={{ background: hex }} />
      <span>{label}</span>
    </div>
  );
}
