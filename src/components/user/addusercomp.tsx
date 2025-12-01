"use client";

import React, { useState } from "react";

const AddUserComp: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // State untuk manual input
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Handle input text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  // Handle Save manual user
  const handleSaveUser = async () => {
    if (!form.name || !form.username || !form.password) {
      setMessage("❌ Semua field harus diisi");
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

      setMessage("✅ Juri berhasil ditambahkan!");
      setForm({ name: "", username: "", password: "", status: "active" });
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle File Upload (masih dummy)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file.name);
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
                  className={`alert mt-3 ${
                    message.startsWith("✅")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}
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
                    Selected: {selectedFile}
                  </small>
                )}
              </div>

              <div className="alert alert-info">
                <small>
                  <i className="bi bi-info-circle me-2"></i>
                  Upload an Excel file with columns: Name, Username, Password
                </small>
              </div>
              <button
                className="btn btn-success w-100"
                onClick={() => alert("File upload feature coming soon!")}
                disabled={!selectedFile}
              >
                <i className="bi bi-upload me-2"></i>
                Upload File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserComp;
