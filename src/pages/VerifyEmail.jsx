import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const baseUrl = window.__APP_CONFIG__.API_BASE;
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setStatus("error");
          setMessage("Token d'activation manquant.");
          return;
        }

        // Appel à votre backend Node.js sur le port 4000
        const response = await fetch(`${baseUrl}/api/activation/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Votre compte a été activé avec succès !");
          // Redirection vers la page de connexion après 3 secondes
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            data.error || "Erreur lors de l'activation de votre compte."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        setStatus("error");
        setMessage(
          "Une erreur s'est produite lors de l'activation de votre compte."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafb",
    padding: "20px",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "14px",
    boxShadow: "0 4px 24px rgba(30, 106, 142, 0.13)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
    border: "1.5px solid #e3e3e3",
  };

  const titleStyle = {
    color: "#1e6a8e",
    fontSize: "1.5rem",
    fontWeight: "800",
    marginBottom: "20px",
  };

  const messageStyle = {
    fontSize: "1rem",
    marginBottom: "20px",
    lineHeight: "1.5",
    color:
      status === "success"
        ? "#2e7d32"
        : status === "error"
        ? "#c62828"
        : "#1e6a8e",
  };

  const spinnerStyle = {
    width: "40px",
    height: "40px",
    margin: "20px auto",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #1e6a8e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #1e6a8e 60%, #7fa22b 100%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1rem",
    padding: "12px 30px",
    borderRadius: "8px",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(30, 106, 142, 0.13)",
    marginTop: "20px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Activation de votre compte</h1>

        {status === "verifying" && (
          <>
            <div style={spinnerStyle}></div>
            <p style={messageStyle}>Activation de votre compte en cours...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                fontSize: "3rem",
                color: "#2e7d32",
                marginBottom: "20px",
              }}
            >
              ✓
            </div>
            <p style={messageStyle}>
              {message}
              <br />
              <br />
              Vous allez être redirigé vers la page de connexion dans quelques
              secondes.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                fontSize: "3rem",
                color: "#c62828",
                marginBottom: "20px",
              }}
            >
              ✗
            </div>
            <p style={messageStyle}>{message}</p>
            <button style={buttonStyle} onClick={() => navigate("/login")}>
              Retour à la connexion
            </button>
          </>
        )}

        <div
          style={{
            marginTop: "30px",
            fontSize: "0.9rem",
            color: "#888",
            borderTop: "1px solid #e3e3e3",
            paddingTop: "20px",
          }}
        >
          <b>Ministère des Mines et de l'Industrie</b>
          <br />
          Direction Générale de l'Industrie
          <br />
          <span style={{ color: "#7fa22b" }}>
            République Islamique de Mauritanie
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default VerifyEmail;
