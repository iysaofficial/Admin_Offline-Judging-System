"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditParticipantsComp() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    booth_code: "",
    country: "",
    project_title: "",
    school: "",
    category: "",
    level: "",
  });

  // ===== FETCH DATA BY ID =====
  useEffect(() => {
    const fetchParticipant = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error(error);
        setMessage({ type: "danger", text: "Participant not found." });
        setLoading(false);
        return;
      }

      // Set data ke form
      setFormData({
        booth_code: data.booth_code || "",
        country: data.country || "",
        project_title: data.project_title || "",
        school: data.school || "",
        category: data.category || "",
        level: data.level || "",
      });

      setLoading(false);
    };

    fetchParticipant();
  }, [id]);

  // ===== HANDLE CHANGE =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===== HANDLE UPDATE =====
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("participants")
      .update(formData)
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage({ type: "danger", text: "Failed to update participant." });
      return;
    }

    setMessage({ type: "success", text: "Participant updated successfully!" });

    setTimeout(() => {
      router.push("/listparticipants");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p>Loading participant data...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-4">
        <i className="bi bi-pencil-square me-2 text-primary"></i>
        Edit Participant
      </h2>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
          {/* BOOTH CODE */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Booth Code</label>
            <input
              type="text"
              name="booth_code"
              className="form-control"
              value={formData.booth_code}
              onChange={handleChange}
            />
          </div>

          {/* COUNTRY */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Country</label>
            <input
              type="text"
              name="country"
              className="form-control"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          {/* PROJECT TITLE */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Project Title</label>
            <input
              type="text"
              name="project_title"
              className="form-control"
              value={formData.project_title}
              onChange={handleChange}
            />
          </div>

          {/* SCHOOL */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Name School</label>
            <input
              type="text"
              name="school"
              className="form-control"
              value={formData.school}
              onChange={handleChange}
            />
          </div>

          {/* CATEGORY */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Category</label>
            <input
              type="text"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          {/* LEVEL */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Level</label>
            <select
              name="level"
              className="form-select"
              value={formData.level}
              onChange={handleChange}
            >
              <option value="">Select level</option>
              <option value="Elementary">Elementary</option>
              <option value="Secondary">Secondary</option>
              <option value="University">University</option>
              <option>Sekolah Menengah Pertama</option>
              <option>Sekolah Menengah Atas</option>
              <option>Universitas</option>
            </select>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/listparticipants")}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
