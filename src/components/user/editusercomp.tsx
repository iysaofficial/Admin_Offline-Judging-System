"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id?: string;
  name: string;
  username: string;
  password: string;
  status?: string;
}

interface EditUserCompProps {
  user?: User | null;
}

export default function EditUserComp({ user }: EditUserCompProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<User>({
    name: "",
    username: "",
    password: "",
    status: "active",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name || "",
        username: user.username || "",
        password: user.password || "",
        status: user.status || "active",
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { error } = await supabase
        .from("judges")
        .update({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          status: formData.status,
        })
        .eq("id", formData.id);

      if (error) throw error;

      setMessage("Data juri berhasil diperbarui!");
      setTimeout(() => router.push("/listuser"), 1500);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memperbarui data juri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow">
      <h4 className="mb-3">
        <i className="bi bi-pencil-square me-2 text-primary"></i>
        Edit User
      </h4>

      {message && (
        <div className="alert alert-success d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Judge Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Status</label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push("/listuser")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
