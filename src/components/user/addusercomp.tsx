"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";

const AddUserComp: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State untuk manual input
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Handle input text
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  // Handle Save manual user
  const handleSaveUser = async () => {
    if (!form.name || !form.username || !form.password) {
      setMessage({ type: "danger", text: "Semua field harus diisi!" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menambahkan juri");

      setMessage({ type: "success", text: "Juri berhasil ditambahkan!" });
      setForm({ name: "", username: "", password: "", status: "active" });
    } catch (err: any) {
      setMessage({ type: "danger", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(null);
  };

  // Handle Bulk Upload
  const handleBulkUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "danger", text: "Please select a file." });
      return;
    }

    setLoading(true);
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
            const res = await fetch("/api/judges", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: row.name,
                username: row.username,
                password: row.password,
                status: row.status || "active",
              }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || `Failed to add ${row.name}`);
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
        setMessage({ type: "danger", text: error.message });
      } finally {
        setLoading(false);
        setSelectedFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleExportTemplate = () => {
    const templateData = [
      ["name", "username", "password", "status (optional)"],
      ["John Doe", "johndoe", "password123", "active"],
    ];
    const templateSheet = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, templateSheet, "Judges Template");
    XLSX.writeFile(wb, "judges_template.xlsx");
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-person-plus me-2 text-primary"></i>
        Add New Judges
      </h2>

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
                <label className="form-label fw-semibold">Judge Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter username"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter password"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={handleSaveUser}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Save User
                  </>
                )}
              </button>

              {message && (
                <div
                  className={`alert mt-3 alert-${message.type}`}
                >
                  {message.text}
                </div>
              )}
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
                  Upload an Excel file with columns: name, username, password, status (optional)
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
                onClick={handleBulkUpload}
                disabled={!selectedFile || loading}
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
};

export default AddUserComp;
