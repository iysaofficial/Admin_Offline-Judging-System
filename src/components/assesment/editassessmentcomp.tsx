"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SubPoint {
  id: string;
  title: string;
}

interface Theme {
  id: string;
  title: string;
  points: SubPoint[];
}

export default function EditAssessmentComp() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  const [formData, setFormData] = useState({ name: "", level: "" });
  const [themes, setThemes] = useState<Theme[]>([]);

  // Auto dismiss alert
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ==============================
  //  FETCH DATA
  // ==============================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("assessment_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error load data:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Struktur baru: { themes: [...] }
      let rawThemes = [];

      if (data.structure && typeof data.structure === "object") {
        rawThemes = data.structure.themes ?? [];
      }

      const normalized: Theme[] = rawThemes.map((t: any) => ({
        id: t.id?.toString() ?? crypto.randomUUID(),
        title: t.title ?? "",
        points: Array.isArray(t.points)
          ? t.points.map((s: any) => ({
              id: s.id?.toString() ?? crypto.randomUUID(),
              title: s.title ?? "",
            }))
          : [],
      }));

      setFormData({ name: data.name, level: data.level });
      setThemes(normalized);
      setLoading(false);
    };

    load();
  }, [id]);

  // ==============================
  //  FORM HANDLERS
  // ==============================
  const handleChange = (e: any) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTheme = () => {
    setThemes([
      ...themes,
      {
        id: crypto.randomUUID(),
        title: "",
        points: [{ id: crypto.randomUUID(), title: "" }],
      },
    ]);
  };

  const removeTheme = (themeId: string) => {
    setThemes(themes.filter((t) => t.id !== themeId));
  };

  const updateThemeTitle = (themeId: string, title: string) => {
    setThemes(
      themes.map((t) => (t.id === themeId ? { ...t, title } : t))
    );
  };

  const addSubPoint = (themeId: string) => {
    setThemes(
      themes.map((t) =>
        t.id === themeId
          ? {
              ...t,
              points: [
                ...t.points,
                { id: crypto.randomUUID(), title: "" },
              ],
            }
          : t
      )
    );
  };

  const updateSubPoint = (themeId: string, subId: string, title: string) => {
    setThemes(
      themes.map((t) =>
        t.id === themeId
          ? {
              ...t,
              points: t.points.map((s) =>
                s.id === subId ? { ...s, title } : s
              ),
            }
          : t
      )
    );
  };

  const removeSubPoint = (themeId: string, subId: string) => {
    setThemes(
      themes.map((t) =>
        t.id === themeId
          ? {
              ...t,
              points: t.points.filter((s) => s.id !== subId),
            }
          : t
      )
    );
  };

  // ==============================
  //  SAVE
  // ==============================
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.level.trim()) {
      setMessage({ type: "danger", text: "Nama & Level wajib diisi!" });
      return;
    }

    const cleanedThemes = themes.map((t) => ({
      ...t,
      points: t.points.filter((s) => s.title.trim() !== ""),
    }));

    setSaving(true);

    const { error } = await supabase
      .from("assessment_templates")
      .update({
        name: formData.name,
        level: formData.level,
        structure: {
          themes: cleanedThemes,
        },
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage({ type: "danger", text: "Gagal menyimpan perubahan." });
      setSaving(false);
      return;
    }

    setMessage({ type: "success", text: "Assessment berhasil diperbarui!" });

    setTimeout(() => router.push("/listassessment"), 1200);
  };

  // ==============================
  //  UI
  // ==============================
  if (loading)
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );

  if (notFound)
    return (
      <div className="alert alert-danger mt-4">
        Assessment tidak ditemukan.
      </div>
    );

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-bold bg-white">
        <i className="bi bi-pencil-square me-2"></i>Edit Assessment
      </div>

      <div className="card-body p-4">
        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {/* MAIN FIELDS */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Level</label>
            <select
              name="level"
              className="form-select"
              value={formData.level}
              onChange={handleChange}
            >
              <option value="">Select level</option>
              <option>Elementary</option>
              <option>Secondary</option>
              <option>University</option>
              <option>Sekolah Menengah Pertama</option>
              <option>Sekolah Menengah Atas</option>
              <option>Universitas</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Main Theme</label>
            <input
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr />

        {/* THEMES */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5>Assessment Themes</h5>
          <button className="btn btn-success btn-sm" onClick={addTheme}>
            + Add Theme
          </button>
        </div>

        {themes.map((t, i) => (
          <div key={t.id} className="border p-3 mb-3 rounded">
            <div className="d-flex mb-2">
              <span className="input-group-text me-2">{i + 1}.</span>
              <input
                className="form-control"
                value={t.title}
                onChange={(e) =>
                  updateThemeTitle(t.id, e.target.value)
                }
              />
              {themes.length > 1 && (
                <button
                  className="btn btn-outline-danger ms-2"
                  onClick={() => removeTheme(t.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>

            {/* points */}
            <div className="ms-4">
              {t.points.map((s, j) => (
                <div key={s.id} className="input-group input-group-sm mb-2">
                  <span className="input-group-text">
                    {i + 1}.{j + 1}
                  </span>
                  <input
                    className="form-control"
                    value={s.title}
                    onChange={(e) =>
                      updateSubPoint(t.id, s.id, e.target.value)
                    }
                  />
                  {t.points.length > 1 && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() =>
                        removeSubPoint(t.id, s.id)
                      }
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              ))}

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => addSubPoint(t.id)}
              >
                + Add Sub-point
              </button>
            </div>
          </div>
        ))}

        {/* BUTTONS */}
        <div className="text-end mt-3">
          <button
            className="btn btn-secondary me-2"
            onClick={() => router.push("/listassessment")}
          >
            Cancel
          </button>
          <button
            className="btn btn-success"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
