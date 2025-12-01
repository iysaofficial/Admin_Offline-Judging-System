"use client";

import { supabase } from "@/lib/supabaseClient";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  password: string;
}

export default function JuryLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | MouseEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Harap isi semua kolom");
      return;
    }

    setIsLoading(true);

    try {
      const { data: adminData, error: fetchError } = await supabase
        .from("admins")
        .select("*")
        .eq("username", formData.username)
        .single();

      if (fetchError || !adminData) {
        setError("Username tidak ditemukan");
        setIsLoading(false);
        return;
      }

      if (formData.password !== adminData.password) {
        setError("Password salah");
        setIsLoading(false);
        return;
      }

      document.cookie = `adminUser=${adminData.username}; path=/; max-age=86400; SameSite=Lax;`;
      localStorage.setItem("adminUser", JSON.stringify(adminData));

      alert("Login berhasil! Mengarahkan ke dashboard...");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center vh-100">
      <div className="branding-side">
        <div className="branding-content">
          <div className="brand-icon mb-4">
            <i className="bi bi-award-fill"></i>
          </div>
          <h1 className="brand-title mb-3">IYSA Competition Assessment System</h1>
          <p className="brand-subtitle">
            Secure platform for judges members to evaluate and score competition
            participants with ease and efficiency.
          </p>

          <div className="features mt-4">
            <div className="feature-item">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span>Real-time evaluation</span>
            </div>
            <div className="feature-item">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span>Secure & encrypted</span>
            </div>
            <div className="feature-item">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span>Mobile friendly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-side">
        <div className="form-container">
          <div className="text-center mb-4">
            <div className="login-badge mb-3">
              <i className="bi bi-person-badge-fill"></i>
            </div>
            <h2 className="form-title mb-2">Admin Login Panel</h2>
            <p className="form-subtitle text-muted">
              Welcome to IYSA Assessment System! Please login to your account
            </p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit as any}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="username">
                <i className="bi bi-person me-2"></i> Username
              </label>
            </div>

            <div className="form-floating mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="password">
                <i className="bi bi-lock me-2"></i> Password
              </label>

              <button
                className="password-toggle"
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                <i
                  className={`bi ${
                    showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                  }`}
                ></i>
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>

          <div className="form-footer text-center mt-4">
            <small className="text-muted">
              <i className="bi bi-shield-lock-fill me-1"></i> Your connection is
              secure and encrypted
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
