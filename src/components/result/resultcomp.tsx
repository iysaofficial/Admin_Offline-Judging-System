"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

export default function ResultComp() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1️⃣ Ambil peserta
      const { data: participants, error: pErr } = await supabase
        .from("participants")
        .select("*")
        .order("booth_code", { ascending: true });

      if (pErr || !participants) {
        console.error("Error participants:", pErr);
        setLoading(false);
        return;
      }

      // 2️⃣ Ambil assignment juri
      const { data: assignments, error: aErr } = await supabase
        .from("judge_assignments")
        .select("team_id, judge_id")
        .order("created_at", { ascending: true });

      if (aErr) console.error("Error assignments:", aErr);

      const assignmentList = assignments ?? [];

      // Mapping: team_id → [judge1_id, judge2_id]
      const assignmentMap: Record<string, string[]> = {};
      assignmentList.forEach((a) => {
        if (!assignmentMap[a.team_id]) assignmentMap[a.team_id] = [];
        assignmentMap[a.team_id].push(a.judge_id);
      });

      // 3️⃣ Ambil semua skor
      const { data: scores, error: sErr } = await supabase
        .from("scores")
        .select("*");

      if (sErr) console.error("Error scores:", sErr);

      const scoreList = scores ?? [];

      // 4️⃣ Gabungkan data final
      const finalRows = participants.map((p) => {
        const judgeList = assignmentMap[p.id] || [];

        const judge1_id = judgeList[0] || null;
        const judge2_id = judgeList[1] || null;

        const teamScores = scoreList.filter((s) => s.team_id === p.id);

        let judge1: number | null = null;
        let judge2: number | null = null;

        teamScores.forEach((s) => {
          if (s.judge_id === judge1_id) judge1 = s.total_score;
          if (s.judge_id === judge2_id) judge2 = s.total_score;
        });

        let finalScore = null;
        let medal = null;

        if (judge1 !== null && judge2 !== null) {
          finalScore = (judge1 + judge2) / 2;

          if (finalScore >= 80) medal = "Gold";
          else if (finalScore >= 59) medal = "Silver";
          else medal = "Bronze";
        }

        return {
          team_id: p.id,
          booth: p.booth_code,
          project: p.project_title,
          school: p.school,
          category: p.category,
          level: p.level,
          country: p.country,
          judge1,
          judge2,
          finalScore,
          medal,
        };
      });

      setRows(finalRows);
      setLoading(false);
    };

    load();
  }, []);

  // =========================================================
  // EXPORT EXCEL
  // =========================================================
  const exportToExcel = () => {
    const exportData = rows.map((item) => ({
      Booth: item.booth,
      Project_Title: item.project,
      School: item.school,
      Category: item.category,
      Level: item.level,
      Country: item.country,
      Judge_1: item.judge1 ?? "",
      Judge_2: item.judge2 ?? "",
      Final_Score: item.finalScore ?? "",
      Medal: item.medal ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "IYSA_Final_Results.xlsx");
  };

  if (loading) {
    return <p className="text-center mt-5">Loading results...</p>;
  }

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-clipboard-data me-2 text-primary"></i>
        Assessment Results
      </h2>

      {/* EXPORT BUTTON */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <button className="btn btn-success" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel me-2"></i>
            Export Excel
          </button>
        </div>
      </div>

      {/* RESULT TABLE */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light text-center">
                <tr>
                  <th>No</th>
                  <th>Booth</th>
                  <th>Project</th>
                  <th>School</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Country</th>
                  <th>Judge 1</th>
                  <th>Judge 2</th>
                  <th>Final</th>
                  <th>Medal</th>
                  <th>Detail</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.team_id}>
                    <td className="text-center">{idx + 1}</td>
                    <td className="text-center">{r.booth}</td>
                    <td><strong>{r.project}</strong></td>
                    <td>{r.school}</td>
                    <td className="text-center">{r.category}</td>
                    <td className="text-center">{r.level}</td>
                    <td className="text-center">{r.country}</td>

                    <td className="text-center">{r.judge1 ?? "-"}</td>
                    <td className="text-center">{r.judge2 ?? "-"}</td>

                    <td className="text-center fw-bold">
                      {r.finalScore ?? "-"}
                    </td>

                    <td className="text-center">
                      {r.medal ? (
                        <span
                          className={`badge px-3 py-2 ${
                            r.medal === "Gold"
                              ? "bg-warning text-dark"
                              : r.medal === "Silver"
                              ? "bg-secondary"
                              : "bg-danger"
                          }`}
                        >
                          {r.medal}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => router.push(`/result/detail/${r.team_id}`)}
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
