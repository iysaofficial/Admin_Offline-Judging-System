// ============================================
// FILE: components/dashboard/dashboardcomp.tsx
// ============================================

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Judge {
  judge_id: string;
  judge_name: string;
  username: string;
  status: string;
  total_assigned: number;
  completed: number;
  progress_percent: number;
  progress_status: string;
}

const DashboardComp = () => {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // ========== FETCH FROM judge_progress_view ==========
      const { data: judgeProgressData, error: progressErr } = await supabase
        .from("judge_progress_view")
        .select("*")
        .order("judge_name", { ascending: true });

      if (progressErr) {
        throw new Error("Failed to fetch judge progress: " + progressErr.message);
      }

      setJudges(judgeProgressData || []);

    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      setErrorMessage(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ========== CALCULATE TOTALS ==========
  const totalJudges = judges.length;
  const totalAssigned = judges.reduce((sum, j) => sum + j.total_assigned, 0);
  const totalCompleted = judges.reduce((sum, j) => sum + j.completed, 0);
  const totalInProgress = totalAssigned - totalCompleted;

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading dashboard...</p>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (errorMessage) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {errorMessage}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h2 className="mb-4">
        <i className="bi bi-speedometer2 me-2 text-primary"></i>
        Dashboard Overview
      </h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Total Judges</h6>
                  <h2 className="mb-0 fw-bold">{totalJudges}</h2>
                </div>
                <i className="bi bi-people-fill" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Completed</h6>
                  <h2 className="mb-0 fw-bold">{totalCompleted}</h2>
                </div>
                <i className="bi bi-check-circle-fill" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-dark-50 mb-1">In Progress</h6>
                  <h2 className="mb-0 fw-bold">{totalInProgress}</h2>
                </div>
                <i className="bi bi-hourglass-split" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Total Assigned</h6>
                  <h2 className="mb-0 fw-bold">{totalAssigned}</h2>
                </div>
                <i className="bi bi-clipboard-check-fill" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Judges Progress Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0">
            <i className="bi bi-people-fill me-2 text-primary"></i>
            Judges Progress
          </h5>
        </div>

        <div className="card-body p-0">
          {judges.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              <p className="text-muted mt-2">No judges found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">No</th>
                    <th>Judge Name</th>
                    <th className="text-center">Assigned</th>
                    <th className="text-center">Completed</th>
                    <th style={{ width: "35%" }}>Progress</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {judges.map((j, index) => {
                    const percent = j.progress_percent;
                    const isComplete = j.progress_status === 'Complete';

                    return (
                      <tr key={j.judge_id}>
                        <td className="px-4">{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                                 style={{ width: "40px", height: "40px" }}>
                              <i className="bi bi-person-fill"></i>
                            </div>
                            <div>
                              <span className="fw-semibold d-block">{j.judge_name}</span>
                              <small className="text-muted">@{j.username}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary rounded-pill">{j.total_assigned}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-success rounded-pill">{j.completed}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between mb-1">
                                <small className="text-muted">
                                  {j.completed} / {j.total_assigned}
                                </small>
                                <small className="fw-semibold">
                                  {percent.toFixed(0)}%
                                </small>
                              </div>
                              <div className="progress" style={{ height: "10px" }}>
                                <div
                                  className={`progress-bar ${
                                    isComplete ? "bg-success" : "bg-primary"
                                  }`}
                                  role="progressbar"
                                  style={{ width: `${percent}%` }}
                                  aria-valuenow={percent}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          {j.progress_status === 'Complete' && (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Complete
                            </span>
                          )}
                          {j.progress_status === 'In Progress' && (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-hourglass-split me-1"></i>
                              In Progress
                            </span>
                          )}
                          {j.progress_status === 'Not Started' && (
                            <span className="badge bg-secondary">
                              <i className="bi bi-dash-circle me-1"></i>
                              Not Started
                            </span>
                          )}
                          {j.progress_status === 'No Assignment' && (
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-inbox me-1"></i>
                              No Assignment
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table Footer with Summary */}
        {judges.length > 0 && (
          <div className="card-footer bg-light">
            <div className="row text-center">
              <div className="col-md-4">
                <small className="text-muted d-block">Overall Progress</small>
                <strong className="fs-5">
                  {totalAssigned > 0 ? ((totalCompleted / totalAssigned) * 100).toFixed(1) : 0}%
                </strong>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block">Completion Rate</small>
                <strong className="fs-5">
                  {totalCompleted} / {totalAssigned}
                </strong>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block">Active Judges</small>
                <strong className="fs-5">
                  {judges.filter(j => j.completed > 0).length} / {totalJudges}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardComp;