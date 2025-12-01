"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ==============================
// Helper ID generator
// ==============================
const generateThemeId = (index: number) => `t${index + 1}`;
const generateSubId = (themeIndex: number, subIndex: number) =>
  `t${themeIndex + 1}p${subIndex + 1}`;

interface ThemeInput {
  title: string;
  points: string[];
}

export default function AddAssessmentComp() {
  const [level, setLevel] = useState("Elementary");
  const [mainTheme, setMainTheme] = useState("");
  const [themes, setThemes] = useState<ThemeInput[]>([
    { title: "", points: [""] },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // ============================
  // THEME HANDLERS
  // ============================

  const addTheme = () => {
    setThemes([...themes, { title: "", points: [""] }]);
  };

  const removeTheme = (index: number) => {
    setThemes(themes.filter((_, i) => i !== index));
  };

  const updateThemeTitle = (index: number, title: string) => {
    const copy = [...themes];
    copy[index].title = title;
    setThemes(copy);
  };

  const addSubPoint = (themeIndex: number) => {
    const copy = [...themes];
    copy[themeIndex].points.push("");
    setThemes(copy);
  };

  const updateSubPoint = (themeIndex: number, subIndex: number, val: string) => {
    const copy = [...themes];
    copy[themeIndex].points[subIndex] = val;
    setThemes(copy);
  };

  const removeSubPoint = (themeIndex: number, subIndex: number) => {
    const copy = [...themes];
    copy[themeIndex].points = copy[themeIndex].points.filter(
      (_, i) => i !== subIndex
    );
    setThemes(copy);
  };

  // ============================
  // SAVE TO SUPABASE
  // ============================
  const handleSave = async () => {
    setMessage(null);

    if (!mainTheme.trim()) {
      setMessage({
        type: "danger",
        text: "Harap isi main theme!",
      });
      return;
    }

    if (themes.some((t) => !t.title.trim())) {
      setMessage({
        type: "danger",
        text: "Semua theme wajib ada judul.",
      });
      return;
    }

    if (themes.some((t) => t.points.every((s) => !s.trim()))) {
      setMessage({
        type: "danger",
        text: "Setiap theme wajib memiliki minimal 1 sub-point.",
      });
      return;
    }

    setLoading(true);

    // ============================
    // BENTUKKAN STRUKTUR FINAL
    // ============================
    const structure = {
      themes: themes.map((theme, tIndex) => ({
        id: generateThemeId(tIndex),
        title: theme.title.trim(),
        points: theme.points
          .filter((s) => s.trim() !== "")
          .map((sub, sIndex) => ({
            id: generateSubId(tIndex, sIndex),
            title: sub.trim(),
          })),
      })),
    };

    // Debug
    console.log("🔥 FINAL JSON STRUCTURE:", structure);

    const { error } = await supabase.from("assessment_templates").insert([
      {
        level,
        name: mainTheme,
        structure, // <<<<<< EXACT JSON FINAL
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      setMessage({
        type: "danger",
        text: "Gagal menyimpan template. " + error.message,
      });
    } else {
      setMessage({
        type: "success",
        text: "Assessment berhasil disimpan!",
      });

      // reset form
      setMainTheme("");
      setThemes([{ title: "", points: [""] }]);
    }
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-file-earmark-plus me-2 text-primary"></i>
        Add New Assessment
      </h2>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          {/* LEVEL + MAIN NAME */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Level</label>
              <select
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>Elementary</option>
                <option>Secondary</option>
                <option>University</option>
                <option>Sekolah Dasar</option>
                <option>Sekolah Menengah Pertama</option>
                <option>Sekolah Menengah Atas</option>
                <option>Universitas</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Main Theme</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nama template"
                value={mainTheme}
                onChange={(e) => setMainTheme(e.target.value)}
              />
            </div>
          </div>

          <hr />

          {/* THEMES BUILDER */}
          <div>
            <div className="d-flex justify-content-between mb-3">
              <h5 className="mb-0">Themes & Sub-points</h5>

              <button className="btn btn-success btn-sm" onClick={addTheme}>
                <i className="bi bi-plus-circle me-1"></i> Add Theme
              </button>
            </div>

            {themes.map((theme, tIndex) => (
              <div className="border rounded p-3 mb-3" key={tIndex}>
                {/* THEME TITLE */}
                <div className="d-flex mb-2">
                  <span className="input-group-text me-2">
                    {tIndex + 1}.
                  </span>

                  <input
                    className="form-control"
                    placeholder="Theme title"
                    value={theme.title}
                    onChange={(e) =>
                      updateThemeTitle(tIndex, e.target.value)
                    }
                  />

                  {themes.length > 1 && (
                    <button
                      className="btn btn-outline-danger ms-2"
                      onClick={() => removeTheme(tIndex)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>

                {/* SUBPOINT LIST */}
                <div className="ms-4">
                  {theme.points.map((sub, sIndex) => (
                    <div
                      key={sIndex}
                      className="input-group input-group-sm mb-2"
                    >
                      <span className="input-group-text">
                        {tIndex + 1}.{sIndex + 1}
                      </span>

                      <input
                        className="form-control"
                        placeholder="Sub-point"
                        value={sub}
                        onChange={(e) =>
                          updateSubPoint(tIndex, sIndex, e.target.value)
                        }
                      />

                      {theme.points.length > 1 && (
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => removeSubPoint(tIndex, sIndex)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => addSubPoint(tIndex)}
                  >
                    + Add Sub-point
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary w-100"
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? "Saving..." : "Save Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
