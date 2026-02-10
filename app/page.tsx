"use client";

import { useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "agentic-mobile-notes";

const emptyNoteForm = {
  title: "",
  body: "",
  tags: [] as string[],
  tagDraft: ""
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState(emptyNoteForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Note[];
        setNotes(parsed);
      } catch (error) {
        console.warn("Failed to parse notes:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const tagSet = new Set(activeTags);

    return notes.filter((note) => {
      const matchesSearch =
        query.length === 0 ||
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query);

      const matchesTags =
        tagSet.size === 0 || [...tagSet].every((tag) => note.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [notes, search, activeTags]);

  const tagInventory = useMemo(() => {
    const counts = notes.reduce<Map<string, number>>((map, note) => {
      note.tags.forEach((tag) => {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      });
      return map;
    }, new Map());

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [notes]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setForm(emptyNoteForm);
    setEditingId(null);
  };

  const handleSave = () => {
    const title = form.title.trim();
    const body = form.body.trim();
    const tags = form.tags.map((tag) => tag.trim()).filter(Boolean);

    if (!title && !body) {
      return;
    }

    if (editingId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title,
                body,
                tags,
                updatedAt: new Date().toISOString()
              }
            : note
        )
      );
    } else {
      setNotes((prev) => [
        {
          id: crypto.randomUUID(),
          title,
          body,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setForm({
      title: note.title,
      body: note.body,
      tags: note.tags,
      tagDraft: ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addTagFromDraft = () => {
    const draft = form.tagDraft.trim().toLowerCase();
    if (!draft) {
      return;
    }

    if (form.tags.includes(draft)) {
      setForm((prev) => ({ ...prev, tagDraft: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, draft],
      tagDraft: ""
    }));
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <main className="app-shell">
      <section className="mobile-card">
        <header className="heading">
          <h1>Pocket Notes</h1>
          <span className="counter">{notes.length} notes</span>
        </header>

        <div className="search-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m21 21-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0Z"
            />
          </svg>
          <input
            aria-label="Search notes"
            placeholder="Search notes or tags"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <form
          className="note-form"
          onSubmit={(event) => {
            event.preventDefault();
            addTagFromDraft();
            handleSave();
          }}
        >
          <input
            className="input"
            placeholder="Title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />

          <textarea
            className="input"
            rows={5}
            placeholder="Write your note..."
            value={form.body}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, body: event.target.value }))
            }
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Add tag (press enter)"
              value={form.tagDraft}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tagDraft: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTagFromDraft();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              aria-label="Add tag"
              onClick={addTagFromDraft}
            >
              Add
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {form.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((t) => t !== tag)
                    }))
                  }
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="note-actions">
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Note" : "Save Note"}
            </button>
          </div>
        </form>
      </section>

      <section className="mobile-card">
        <header className="heading" style={{ alignItems: "flex-start" }}>
          <div>
            <h2 style={{ marginBottom: "0.25rem" }}>Tags</h2>
            <p className="muted" style={{ margin: 0 }}>
              Filter notes by tags below
            </p>
          </div>
          {activeTags.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setActiveTags([])}>
              Clear
            </button>
          )}
        </header>

        <div className="tag-filter-container">
          {tagInventory.length === 0 && (
            <span className="muted">Tags appear after you add them to notes.</span>
          )}
          {tagInventory.map(({ name, count }) => (
            <button
              key={name}
              className={`tag-filter${activeTags.includes(name) ? " active" : ""}`}
              type="button"
              onClick={() => toggleTag(name)}
            >
              <span>#{name}</span>
              <small>{count}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="mobile-card">
        <header className="heading" style={{ alignItems: "baseline" }}>
          <h2>Notes</h2>
          <span className="counter">
            {filteredNotes.length} / {notes.length} visible
          </span>
        </header>

        <div className="notes-list">
          {filteredNotes.length === 0 && (
            <div className="empty-state">
              <p>No notes match your search or filter.</p>
              <p style={{ marginTop: "0.5rem" }}>Create your first note above.</p>
            </div>
          )}

          {filteredNotes.map((note) => (
            <article key={note.id} className="note-card">
              <header style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                <div>
                  <h3>{note.title || "Untitled"}</h3>
                  <time dateTime={note.updatedAt}>Edited {formatDate(note.updatedAt)}</time>
                </div>
                <div className="note-actions">
                  <button className="btn btn-secondary" onClick={() => handleEdit(note)}>
                    Edit
                  </button>
                  <button className="btn" style={{ background: "rgba(255,77,109,0.15)", color: "var(--danger)" }} onClick={() => handleDelete(note.id)}>
                    Delete
                  </button>
                </div>
              </header>

              {note.body && <p>{note.body}</p>}

              {note.tags.length > 0 && (
                <footer className="note-card-footer">
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {note.tags.map((tag) => (
                      <span key={tag} className="tag-chip" style={{ padding: "0.4rem 0.65rem" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <time dateTime={note.createdAt}>Created {formatDate(note.createdAt)}</time>
                </footer>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
