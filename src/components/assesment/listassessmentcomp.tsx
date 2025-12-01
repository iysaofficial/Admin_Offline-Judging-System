"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Assessment {
  id: string;
  level: string;
  name: string;
  structure: {
    themes: {
      id: string;
      title: string;
      subPoints: any[];
    }[];
  };
  created_at: string;
}

export default function ListAssessmentComp() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // ======================
  // FETCH DATA
  // ======================
  const fetchAssessments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("assessment_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage({
        type: "danger",
        text: "Gagal memuat data assessment.",
      });
    } else {
      setAssessments((data as Assessment[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus assessment ini?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("assessment_templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage({ type: "danger", text: "Gagal menghapus template!" });
    } else {
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      setMessage({ type: "success", text: "Template berhasil dihapus!" });
    }
  };

  // ======================
  // UI TABLE
  // ======================
  return (
    <div>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-file-earmark-text me-2 text-primary"></i>
          List of Assessments
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/addassessment")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New
        </button>
      </div>

      {/* ALERT */}
      {message && (
        <div
          className={`alert alert-${message.type} d-flex align-items-center`}
          role="alert"
        >
          <i
            className={`bi me-2 ${
              message.type === "success"
                ? "bi-check-circle-fill"
                : "bi-exclamation-triangle-fill"
            }`}
          ></i>
          {message.text}
        </div>
      )}

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted">Tidak ada assessment tersedia.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Main Theme</th>
                    <th>Level</th>
                    <th>Total Themes</th>
                    <th>Created At</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {assessments.map((a, index) => {
                    const themeCount = a.structure?.themes?.length || 0;

                    return (
                      <tr key={a.id}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{a.name}</td>

                        <td>
                          <span className="badge bg-info text-dark">
                            {a.level}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-secondary">
                            {themeCount} Themes
                          </span>
                        </td>

                        <td>
                          {new Date(a.created_at).toLocaleDateString("id-ID")}
                        </td>

                        <td className="text-center">
                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() =>
                              router.push(`/editassessment/${a.id}`)
                            }
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(a.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
