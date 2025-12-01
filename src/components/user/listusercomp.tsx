"use client";
import { useRouter } from "next/navigation"; 
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Judge {
  id: string;
  name: string;
  username: string;
  password: string;
  assigned_task: number;
  completed_task: number;
  last_login: string | null;
  status: string;
  created_at: string;
}

const ListUserComp: React.FC = () => {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Judge | null>(null);
  const router = useRouter();
  // Fetch data juri
  const fetchJudges = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("judges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching judges:", error.message);
      setError("Gagal memuat data juri.");
    } else {
      setJudges(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJudges();
  }, []);

  // Fungsi hapus juri
  const handleDelete = async (id: string) => {
    setError(null);
    setMessage(null);

    const { error } = await supabase.from("judges").delete().eq("id", id);

    if (error) {
      console.error("Error deleting judge:", error.message);
      setError("Gagal menghapus juri.");
    } else {
      setMessage("Juri berhasil dihapus!");
      fetchJudges(); // refresh data
    }

    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-people-fill me-2 text-primary"></i>
        List of Judges
      </h2>

      {/* Pesan sukses / error */}
      {message && (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="alert alert-info">
          <i className="bi bi-hourglass-split me-2"></i> Loading data...
        </div>
      )}

      {/* Tabel */}
      {!loading && judges.length > 0 && (
        <div className="table-responsive shadow-sm">
          <table className="table table-bordered align-middle">
            <thead className="table-primary text-center">
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Assigned</th>
                <th>Completed</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {judges.map((judge, index) => (
                <tr key={judge.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>{judge.name}</td>
                  <td>{judge.username}</td>
                  <td className="text-center">{judge.assigned_task || 0}</td>
                  <td className="text-center">{judge.completed_task || 0}</td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        judge.status === "active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {judge.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {judge.last_login
                      ? new Date(judge.last_login).toLocaleString()
                      : "-"}
                  </td>
                  <td className="text-center">
                    {new Date(judge.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      title="Edit"
                      onClick={() => router.push(`/editusers/${judge.id}`)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => setConfirmDelete(judge)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Konfirmasi Delete */}
      {confirmDelete && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Konfirmasi Hapus
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                Apakah kamu yakin ingin menghapus juri{" "}
                <strong>{confirmDelete.name}</strong>?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmDelete(null)}
                >
                  Batal
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(confirmDelete.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUserComp;
