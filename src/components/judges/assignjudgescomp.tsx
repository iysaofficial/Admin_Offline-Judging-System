// ============================================
// FILE: components/assignjudges/assignjudgescomp.tsx
// ============================================

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// =============================
// TYPE DEFINITIONS
// =============================
interface Judge {
  id: string;
  name: string;
}

interface Participant {
  participant_id: string;
  booth_code: string;
  project_title: string;
  school: string;
  level: string;
  judge1?: string | null;
  judge2?: string | null;
  assigned_count: number;
}

export default function AssignJudgesComp() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedJudge, setSelectedJudge] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState("All");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // =============================
  // LOAD JUDGES
  // =============================
  const fetchJudges = async () => {
    const { data, error } = await supabase
      .from("judges")
      .select("id, name")
      .order("name");

    if (!error && data) {
      setJudges(data);
    }
  };

  // =============================
  // LOAD PARTICIPANTS WITH JUDGE 1 & 2
  // =============================
  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from("participant_assignment_view")
      .select("*")
      .order("booth_code");

    if (error) {
      setMessage({ type: "danger", text: "Gagal memuat peserta." });
      return;
    }

    if (data) {
      setParticipants(data);
    }
  };

  useEffect(() => {
    fetchJudges();
    fetchParticipants();
  }, []);

  // =============================
  // CHECKBOX HANDLING
  // =============================
  const toggleSelect = (id: string, assignedCount: number) => {
    if (assignedCount >= 2) return;

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // =============================
  // CHECK IF PARTICIPANT ALREADY HAS THIS JUDGE
  // =============================
  const isJudgeAlreadyAssigned = (participant: Participant, judgeId: string): boolean => {
    if (!judgeId) return false;
    
    const selectedJudgeName = judges.find(j => j.id === judgeId)?.name;
    if (!selectedJudgeName) return false;

    // Cek apakah judge yang dipilih sudah jadi judge1 atau judge2 di participant ini
    return participant.judge1 === selectedJudgeName || participant.judge2 === selectedJudgeName;
  };

  // =============================
  // ASSIGN JUDGE
  // =============================
  const assignJudge = async () => {
    if (!selectedJudge) {
      setMessage({ type: "danger", text: "Pilih juri terlebih dahulu." });
      return;
    }
    if (selected.length === 0) {
      setMessage({ type: "danger", text: "Pilih minimal 1 peserta." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      for (const participantId of selected) {
        // Cek apakah juri ini sudah mengerjakan peserta tsb
        const { data: existing } = await supabase
          .from("judge_assignments")
          .select("*")
          .eq("team_id", participantId)
          .eq("judge_id", selectedJudge);

        if (existing && existing.length > 0) {
          setMessage({
            type: "danger",
            text: "Juri ini sudah bertugas di salah satu participant.",
          });
          setLoading(false);
          return;
        }

        // Cek total juri pada peserta
        const { data: allAssignment } = await supabase
          .from("judge_assignments")
          .select("*")
          .eq("team_id", participantId);

        if (allAssignment && allAssignment.length >= 2) {
          setMessage({
            type: "danger",
            text: "Peserta ini sudah memiliki 2 juri.",
          });
          setLoading(false);
          return;
        }

        // Insert assignment baru
        await supabase.from("judge_assignments").insert([
          {
            judge_id: selectedJudge,
            team_id: participantId,
            status: "not_started",
          },
        ]);
      }

      setSelected([]);
      setMessage({ type: "success", text: "Juri berhasil di-assign!" });
      await fetchParticipants();
    } catch (error) {
      console.error("Error assigning judge:", error);
      setMessage({ type: "danger", text: "Terjadi kesalahan saat assign juri." });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // DELETE ASSIGNMENT WITH CASCADE
  // =============================
  const deleteAssignment = async (participantId: string, judgeName: string) => {
    const judge = judges.find((j) => j.name === judgeName);
    if (!judge) return;

    // Konfirmasi
    const confirmed = window.confirm(
      `Hapus assignment Judge "${judgeName}"?\n\n` +
      `⚠️ PERHATIAN:\n` +
      `- Score dari judge ini akan dihapus\n` +
      `- Final score (medal) akan dihapus\n` +
      `- Participant harus dinilai ulang oleh 2 judge`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      // ========== 1. DELETE SCORE FROM THIS JUDGE ==========
      const { error: scoreError } = await supabase
        .from("scores")
        .delete()
        .eq("team_id", participantId)
        .eq("judge_id", judge.id);

      if (scoreError) {
        console.error("Error deleting score:", scoreError);
        // Continue anyway, karena mungkin belum ada score
      }

      // ========== 2. DELETE FINAL SCORE ==========
      const { error: finalScoreError } = await supabase
        .from("final_scores")
        .delete()
        .eq("team_id", participantId);

      if (finalScoreError) {
        console.error("Error deleting final score:", finalScoreError);
        // Continue anyway
      }

      // ========== 3. DELETE JUDGE ASSIGNMENT ==========
      const { error: assignmentError } = await supabase
        .from("judge_assignments")
        .delete()
        .eq("team_id", participantId)
        .eq("judge_id", judge.id);

      if (assignmentError) {
        throw new Error("Gagal menghapus assignment: " + assignmentError.message);
      }

      setMessage({ 
        type: "success", 
        text: "Assignment berhasil dihapus! Score dan final score juga telah dihapus." 
      });
      
      await fetchParticipants();
    } catch (error: any) {
      console.error("Error in deleteAssignment:", error);
      setMessage({ 
        type: "danger", 
        text: error.message || "Terjadi kesalahan saat menghapus assignment." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-people-fill me-2 text-primary"></i>
        Assign Judges to Participants
      </h2>

      {/* Alert Messages */}
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
          {message.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage(null)}
          ></button>
        </div>
      )}

      {/* Select Judge Card */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <label className="form-label fw-semibold mb-2">
            <i className="bi bi-person-badge me-2 text-primary"></i>
            Select Judge
          </label>
          <select
            className="form-select"
            value={selectedJudge}
            onChange={(e) => setSelectedJudge(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Choose Judge --</option>
            {judges.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-clipboard-check me-2 text-primary"></i>
            Select Participants
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4" style={{ width: "50px" }}>
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      onChange={(e) => {
                        if (e.target.checked) {
                          const availableIds = participants
                            .filter(p => p.assigned_count < 2 && !isJudgeAlreadyAssigned(p, selectedJudge))
                            .map(p => p.participant_id);
                          setSelected(availableIds);
                        } else {
                          setSelected([]);
                        }
                      }}
                      disabled={loading || !selectedJudge}
                    />
                  </th>
                  <th>BOOTH</th>
                  <th>PROJECT TITLE</th>
                  <th>SCHOOL</th>
                  <th>LEVEL</th>
                  <th className="text-center">JUDGE 1</th>
                  <th className="text-center">JUDGE 2</th>
                  <th className="text-center">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                      <p className="text-muted mt-2 mb-0">No participants found</p>
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => {
                    // Cek apakah judge yang dipilih sudah assigned ke participant ini
                    const judgeAlreadyAssigned = isJudgeAlreadyAssigned(p, selectedJudge);
                    const isDisabled = p.assigned_count >= 2 || loading || judgeAlreadyAssigned;
                    
                    return (
                    <tr key={p.participant_id} className={judgeAlreadyAssigned ? 'table-secondary' : ''}>
                      <td className="px-4">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          disabled={isDisabled}
                          checked={selected.includes(p.participant_id)}
                          onChange={() =>
                            toggleSelect(p.participant_id, p.assigned_count)
                          }
                        />
                      </td>
                      <td>
                        <span className="badge bg-primary">{p.booth_code}</span>
                      </td>
                      <td className="fw-semibold">{p.project_title}</td>
                      <td>{p.school}</td>
                      <td>
                        <span className="badge bg-secondary">{p.level}</span>
                      </td>
                      <td className="text-center">
                        {p.judge1 ? (
                          <span className={`badge ${p.judge1 === judges.find(j => j.id === selectedJudge)?.name ? 'bg-warning text-dark' : 'bg-success'}`}>
                            <i className="bi bi-person-check me-1"></i>
                            {p.judge1}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        {p.judge2 ? (
                          <span className={`badge ${p.judge2 === judges.find(j => j.id === selectedJudge)?.name ? 'bg-warning text-dark' : 'bg-success'}`}>
                            <i className="bi bi-person-check me-1"></i>
                            {p.judge2}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group" role="group">
                          {p.judge1 && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                deleteAssignment(p.participant_id, p.judge1!)
                              }
                              disabled={loading}
                              title="Remove Judge 1 (akan hapus score & final score)"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Remove J1
                            </button>
                          )}
                          {p.judge2 && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                deleteAssignment(p.participant_id, p.judge2!)
                              }
                              disabled={loading}
                              title="Remove Judge 2 (akan hapus score & final score)"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Remove J2
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Button Footer */}
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              {selected.length} participant(s) selected
            </span>
            <button
              className="btn btn-primary"
              onClick={assignJudge}
              disabled={!selectedJudge || selected.length === 0 || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Assign to Judge
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="alert alert-info mt-3" role="alert">
        <i className="bi bi-info-circle-fill me-2"></i>
        <strong>Important:</strong>
        <ul className="mb-0 mt-2">
          <li>Pilih judge terlebih dahulu untuk melihat participant yang tersedia</li>
          <li>Participant yang sudah di-assign ke judge yang dipilih akan di-disable (highlight abu-abu)</li>
          <li>Badge kuning menunjukkan judge yang sedang dipilih</li>
          <li>Menghapus assignment judge akan otomatis menghapus score dan final score</li>
          <li>Participant harus dinilai ulang oleh 2 judge untuk mendapatkan final score</li>
        </ul>
      </div>
    </div>
  );
}