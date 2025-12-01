"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Participant {
  id: number;
  noBooth: string;
  country: string;
  projectTitle: string;
  school: string;
  category: string;
  level: string;
  status: string;
  assignedDate: Date;
}

interface FormData {
  noBooth: string;
  country: string;
  projectTitle: string;
  school: string;
  category: string;
  level: string;
  status: string;
}

export default function UserDetailsPage() {
  const router = useRouter();

  const judgeName = "Dr. John Doe";

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      noBooth: "A-01",
      country: "Indonesia",
      projectTitle: "Smart Agriculture IoT System",
      school: "SMA Negeri 1 Jakarta",
      category: "Innovation",
      level: "Senior High School",
      status: "Pending",
      assignedDate: new Date("2025-10-20T10:30:00"),
    },
    {
      id: 2,
      noBooth: "B-05",
      country: "Malaysia",
      projectTitle: "AI-Powered Traffic Management",
      school: "SMK Teknik Kuala Lumpur",
      category: "Technology",
      level: "Vocational",
      status: "Done ",
      assignedDate: new Date("2025-10-21T14:15:00"),
    },
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    noBooth: "",
    country: "",
    projectTitle: "",
    school: "",
    category: "",
    level: "",
    status: "",
  });

  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<
    Omit<Participant, "id" | "assignedDate">[]
  >([]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddParticipant = () => {
    setConfirmAction(() => () => {
      const newParticipant: Participant = {
        id: Date.now(),
        ...formData,
        assignedDate: new Date(),
      };
      setParticipants((prev) => [...prev, newParticipant]);
      setShowAddModal(false);
      setShowConfirmModal(false);
      setFormData({
        noBooth: "",
        country: "",
        projectTitle: "",
        school: "",
        category: "",
        level: "",
        status: "",
      });
      alert("Participant added successfully!");
    });
    setShowConfirmModal(true);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);

      const dummyPreview: Omit<Participant, "id" | "assignedDate">[] = [
        {
          noBooth: "C-10",
          country: "Singapore",
          projectTitle: "Green Energy Solutions",
          school: "Singapore Polytechnic",
          category: "Environment",
          level: "University",
          status: "Pending",
        },
        {
          noBooth: "D-12",
          country: "Thailand",
          projectTitle: "Smart City Platform",
          school: "Bangkok Tech High",
          category: "Innovation",
          level: "Senior High School",
          status: "Pending",
        },
        {
          noBooth: "E-08",
          country: "Vietnam",
          projectTitle: "Water Purification System",
          school: "Hanoi Science School",
          category: "Environment",
          level: "Junior High School",
          status: "Pending",
        },
        {
          noBooth: "F-15",
          country: "Philippines",
          projectTitle: "Educational Game App",
          school: "Manila High School",
          category: "Education",
          level: "Senior High School",
          status: "Done",
        },
        {
          noBooth: "G-03",
          country: "Indonesia",
          projectTitle: "Waste Management AI",
          school: "SMA Negeri 5 Bandung",
          category: "Technology",
          level: "Senior High School",
          status: "Done",
        },
      ];

      setPreviewData(dummyPreview);
    }
  };

  const handleBatchSave = () => {
    setConfirmAction(() => () => {
      const newParticipants: Participant[] = previewData.map((p) => ({
        id: Date.now() + Math.random(),
        ...p,
        assignedDate: new Date(),
      }));
      setParticipants((prev) => [...prev, ...newParticipants]);
      setShowBatchModal(false);
      setShowConfirmModal(false);
      setUploadedFile(null);
      setPreviewData([]);
      alert(`${newParticipants.length} participants added successfully!`);
    });
    setShowConfirmModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      setParticipants((prev) => prev.filter((p) => p.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      alert("Participant removed successfully!");
    }
  };

  const handleSaveChanges = () => setShowSaveModal(true);

  const confirmSaveChanges = () => {
    setShowSaveModal(false);
    alert("Assignments saved successfully!");
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="admin-wrapper">
        {/* Main Content */}
        <div className="content-area p-4">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-person-badge text-primary me-2"></i>
                Judge: {judgeName}
              </h2>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar-check me-2"></i>
                Total Assigned: <strong>{participants.length}</strong>{" "}
                participants
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Participant
              </button>
              <button
                className="btn btn-success"
                onClick={() => setShowBatchModal(true)}
              >
                <i className="bi bi-upload me-2"></i>
                Upload Batch
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Assigned Tasks
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>No</th>
                      <th>No Booth</th>
                      <th>Country</th>
                      <th>Project Title</th>
                      <th>School/Institution</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Assigned Date</th>
                      <th style={{ width: "100px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td className="text-center text-muted py-4">
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          No participants assigned yet
                        </td>
                      </tr>
                    ) : (
                      participants.map((participant, index) => (
                        <tr key={participant.id} className="fade-in">
                          <td>{index + 1}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {participant.noBooth}
                            </span>
                          </td>
                          <td>
                            <i className="bi bi-geo-alt me-1 text-primary"></i>
                            {participant.country}
                          </td>
                          <td>
                            <strong>{participant.projectTitle}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {participant.school}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {participant.category}
                            </span>
                          </td>
                          <td>
                            <small>{participant.level}</small>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                participant.status?.toLowerCase() === "done"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {participant.status}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(participant.assignedDate)}
                            </small>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(participant.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          {participants.length > 0 && (
            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-secondary btn-lg me-5"
                onClick={() => router.push("/listuser")}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Add New Participant
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">No Booth</label>
                    <input
                      type="text"
                      className="form-control"
                      name="noBooth"
                      value={formData.noBooth}
                      onChange={handleInputChange}
                      placeholder="e.g., A-01"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., Indonesia"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Project Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="projectTitle"
                      value={formData.projectTitle}
                      onChange={handleInputChange}
                      placeholder="Enter project title"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      School/Institution
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      placeholder="Enter school or institution name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Enter category"
                    />
                    {/* <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select category</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Technology">Technology</option>
                      <option value="Environment">Environment</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                    </select> */}
                  </div>
                  <div className="col-md-6">
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
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddParticipant}
                >
                  <i className="bi bi-save me-2"></i>
                  Save Participant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Upload Modal */}
      {showBatchModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-upload me-2"></i>
                  Batch Upload Participants
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowBatchModal(false);
                    setUploadedFile(null);
                    setPreviewData([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <h6 className="alert-heading">
                    <i className="bi bi-info-circle me-2"></i>
                    File Format Requirements
                  </h6>
                  <p className="mb-2">
                    <strong>File format:</strong> CSV or XLSX
                  </p>
                  <p className="mb-2">
                    <strong>Columns:</strong> No Booth, Country, Project Title,
                    School/Institution, Category, Level
                  </p>
                  <p className="mb-0">
                    <strong>Example:</strong>
                  </p>
                  <code className="d-block mt-2">
                    A-01, Indonesia, Smart Trash Bin, SMA Negeri 1, Environment,
                    Senior High School
                  </code>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Upload File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                  />
                  {uploadedFile && (
                    <small className="text-success mt-2 d-block">
                      <i className="bi bi-check-circle me-1"></i>
                      File uploaded: {uploadedFile}
                    </small>
                  )}
                </div>

                {previewData.length > 0 && (
                  <div>
                    <h6 className="mb-3">
                      <i className="bi bi-eye me-2"></i>
                      Preview (First 5 rows)
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>No Booth</th>
                            <th>Country</th>
                            <th>Project Title</th>
                            <th>School</th>
                            <th>Category</th>
                            <th>Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <span className="badge bg-secondary">
                                  {row.noBooth}
                                </span>
                              </td>
                              <td>{row.country}</td>
                              <td>
                                <small>{row.projectTitle}</small>
                              </td>
                              <td>
                                <small>{row.school}</small>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {row.category}
                                </span>
                              </td>
                              <td>
                                <small>{row.level}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBatchModal(false);
                    setUploadedFile(null);
                    setPreviewData([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleBatchSave}
                  disabled={previewData.length === 0}
                >
                  <i className="bi bi-save me-2"></i>
                  Save All ({previewData.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-question-circle text-warning me-2"></i>
                  Confirm Action
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">Are you sure to add this participant?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => confirmAction?.()}
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                  Confirm Delete
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to delete this participant assignment?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Changes Confirmation Modal */}
      {showSaveModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-save text-primary me-2"></i>
                  Save All Changes
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSaveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Save all current assignments for this judge?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmSaveChanges}
                >
                  Yes, Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
