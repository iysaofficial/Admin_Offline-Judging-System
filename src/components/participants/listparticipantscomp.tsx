"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  booth_code: string;
  country: string;
  project_title: string;
  school: string;
  category: string;
  level: string;
}

const ListParticipantComp: React.FC = () => {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // ===== Fetch Participants =====
  const fetchParticipants = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .order("booth_code", { ascending: true });

    if (error) {
      console.error(error);
      setMessage({
        type: "danger",
        text: "Gagal memuat data participants.",
      });
    } else {
      setParticipants(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  // ===== Delete Participant =====
  const handleDelete = async (id: string) => {
    const confirmDel = confirm("Yakin ingin menghapus participant ini?");
    if (!confirmDel) return;

    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage({
        type: "danger",
        text: "Gagal menghapus participant.",
      });
    } else {
      setParticipants(participants.filter((p) => p.id !== id));
      setMessage({
        type: "success",
        text: "Participant berhasil dihapus!",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-people me-2 text-primary"></i>
          List of Participants
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/addparticipants")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New
        </button>
      </div>

      {/* Alert */}
      {message && (
        <div className={`alert alert-${message.type} mb-3`}>
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Booth Code</th>
                    <th>Country</th>
                    <th>Project Title</th>
                    <th>School</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, index) => (
                    <tr key={p.id}>
                      <td>{index + 1}</td>
                      <td><strong>{p.booth_code}</strong></td>
                      <td>{p.country}</td>
                      <td>{p.project_title}</td>
                      <td>{p.school}</td>
                      <td>{p.category}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {p.level}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => router.push(`/editparticipants/${p.id}`)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListParticipantComp;
