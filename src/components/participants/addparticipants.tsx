"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

interface Judge {
  id: string;
  name: string;
}

export default function AddParticipantsComp() {
  const [formData, setFormData] = useState({
    booth_code: "",
    country: "",
    project_title: "",
    school: "",
    category: "",
    level: "",
  });

  const [judges, setJudges] = useState<Judge[]>([]); // State untuk menyimpan daftar juri
  const [selectedJudge, setSelectedJudge] = useState<string>(""); // State untuk juri yang dipilih
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // === FETCH JUDGES ===
  useEffect(() => {
    const fetchJudges = async () => {
      const { data, error } = await supabase.from("judges").select("id, name");
      if (error) {
        console.error("Error fetching judges:", error);
      } else {
        setJudges(data);
      }
    };

    fetchJudges();
  }, []);

  // === HANDLE INPUT ===
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "judge_id") {
      setSelectedJudge(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // === FILE CHANGE (BULK UPLOAD) ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleExportTemplate = () => {
    // 1. Buat data untuk lembar template
    const templateData = [
      [
        "booth_code",
        "country",
        "project_title",
        "school",
        "category",
        "level",
        "judge_id",
      ],
    ];
    const templateSheet = XLSX.utils.aoa_to_sheet(templateData);

    // 2. Buat data untuk lembar daftar juri
    const judgesListData = [
      ["judge_id", "judge_name"],
      ...judges.map((judge) => [judge.id, judge.name]),
    ];
    const judgesListSheet = XLSX.utils.aoa_to_sheet(judgesListData);

    // 3. Buat workbook dan tambahkan lembar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, templateSheet, "Participants Template");
    XLSX.utils.book_append_sheet(wb, judgesListSheet, "Judges List");

    // 4. Tulis file dan unduh
    XLSX.writeFile(wb, "participant_template.xlsx");
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "danger", text: "Please select a file to upload." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;

        for (const row of json) {
          try {
            // 1. Insert participant
            const { data: participantData, error: participantError } =
              await supabase
                .from("participants")
                .insert([
                  {
                    booth_code: row.booth_code,
                    country: row.country,
                    project_title: row.project_title,
                    school: row.school,
                    category: row.category,
                    level: row.level,
                  },
                ])
                .select("id")
                .single();

            if (participantError) {
              throw new Error(`Row ${successCount + errorCount + 1}: ${
                participantError.message
              }`);
            }

            // 2. Assign judge if judge_id is present
            if (row.judge_id) {
              const { error: assignmentError } = await supabase
                .from("judge_assignments")
                .insert([
                  {
                    judge_id: row.judge_id,
                    team_id: participantData.id,
                    status: "pending",
                  },
                ]);

              if (assignmentError) {
                throw new Error(`Row ${successCount + errorCount + 1}: ${
                  assignmentError.message
                } (participant was added)`);
              }
            }
            successCount++;
          } catch (rowError) {
            console.error(rowError);
            errorCount++;
          }
        }

        setMessage({
          type: "success",
          text: `Upload complete. ${successCount} successful, ${errorCount} failed.`,
        });
      } catch (error: any) {
        setMessage({
          type: "danger",
          text: error.message || "An error occurred during bulk upload.",
        });
      } finally {
        setLoading(false);
        setSelectedFile(null);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // === SAVE TO SUPABASE ===
  const handleSave = async () => {
    setMessage(null);

    // Validasi
    if (
      !formData.booth_code ||
      !formData.country ||
      !formData.project_title ||
      !formData.school ||
      !formData.category ||
      !formData.level
    ) {
      setMessage({ type: "danger", text: "Semua field harus diisi!" });
      return;
    }

    setLoading(true);

    // 1. Insert ke tabel participants
    const { data: participantData, error: participantError } = await supabase
      .from("participants")
      .insert([
        {
          booth_code: formData.booth_code,
          country: formData.country,
          project_title: formData.project_title,
          school: formData.school,
          category: formData.category,
          level: formData.level,
        },
      ])
      .select("id")
      .single();

    if (participantError) {
      console.error(participantError);
      setMessage({ type: "danger", text: "Gagal menambahkan peserta." });
      setLoading(false);
      return;
    }

    const participantId = participantData.id;

    // 2. Jika juri dipilih, insert ke tabel judge_assignments
    if (selectedJudge) {
      const { error: assignmentError } = await supabase
        .from("judge_assignments")
        .insert([
          {
            judge_id: selectedJudge,
            team_id: participantId,
            status: "pending", // atau status default lainnya
          },
        ]);

      if (assignmentError) {
        console.error(assignmentError);
        setMessage({
          type: "danger",
          text: "Gagal menugaskan juri. Peserta telah ditambahkan.",
        });
        setLoading(false);
        return; // Hentikan eksekusi di sini jika ada error penugasan
      }
    }

    setLoading(false);
    setMessage({ type: "success", text: "Peserta berhasil ditambahkan!" });

    // Reset form
    setFormData({
      booth_code: "",
      country: "",
      project_title: "",
      school: "",
      category: "",
      level: "",
    });
    setSelectedJudge("");
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-person-plus me-2 text-primary"></i>
        Add New Participants
      </h2>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="row">
        {/* Manual Entry */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-fill me-2"></i>
                Manual Entry
              </h5>
            </div>

            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Booth Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="booth_code"
                  value={formData.booth_code}
                  onChange={handleInputChange}
                  placeholder="Enter booth code"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter the country"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Project Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="project_title"
                  value={formData.project_title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Name School</label>
                <input
                  type="text"
                  className="form-control"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="Enter school name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Category</label>
                <input
                  type="text"
                  className="form-control"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Level</label>
                <select
                  className="form-select"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
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

              <div className="mb-3">
                <label className="form-label fw-semibold">Judge</label>
                <select
                  className="form-select"
                  name="judge_id"
                  value={selectedJudge}
                  onChange={handleInputChange}
                >
                  <option value="">Select judge</option>
                  {judges.map((judge) => (
                    <option key={judge.id} value={judge.id}>
                      {judge.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Save Participant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-file-earmark-excel me-2"></i>
                Bulk Upload
              </h5>
            </div>

            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Upload Excel File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <small className="text-success mt-2 d-block">
                    <i className="bi bi-check-circle me-1"></i>
                    Selected: {selectedFile.name}
                  </small>
                )}
              </div>

              <div className="alert alert-info">
                <small>
                  <i className="bi bi-info-circle me-2"></i>
                  Upload an Excel file with columns: Booth Code, Country, Project Title,
                  Name School, Category, Level.
                </small>
              </div>

              <button
                className="btn btn-outline-primary w-100 mb-2"
                onClick={handleExportTemplate}
              >
                <i className="bi bi-download me-2"></i>
                Export Template
              </button>

              <button
                className="btn btn-success w-100"
                disabled={!selectedFile || loading}
                onClick={handleBulkUpload}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-2"></i>
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
