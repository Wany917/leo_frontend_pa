import type React from "react"

interface EmailTemplateProps {
  trackingId: string
  packageName: string
  recipientName: string
  estimatedDelivery: string
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  trackingId,
  packageName,
  recipientName,
  estimatedDelivery,
}) => {
  return (
    <div
      style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px", color: "#333" }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src="/logo.png"
          alt="EcoDeli Logo"
          style={{ height: "40px", width: "auto" }}
        />
      </div>

      <div style={{ backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "30px", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px", color: "#22c55e" }}>Your Package is on its Way!</h1>

        <p style={{ marginBottom: "20px", lineHeight: "1.5" }}>Hello {recipientName},</p>

        <p style={{ marginBottom: "20px", lineHeight: "1.5" }}>
          Great news! Your package <strong>{packageName}</strong> has been picked up by our delivery partner and is now
          on its way to you.
        </p>

        <p style={{ marginBottom: "20px", lineHeight: "1.5" }}>
          <strong>Estimated delivery date:</strong> {estimatedDelivery}
        </p>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e5e5",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Tracking Information</p>
          <p style={{ marginBottom: "5px" }}>
            Tracking ID: <strong>{trackingId}</strong>
          </p>
          <p>You can track your package at any time using the button below.</p>
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <a
            href={`https://ecodeli.com/tracking/${trackingId}`}
            style={{
              backgroundColor: "#22c55e",
              color: "white",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            Track Your Package
          </a>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e5e5",
          paddingTop: "20px",
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "10px" }}>
          If you have any questions, please contact our customer support at{" "}
          <a href="mailto:support@ecodeli.com" style={{ color: "#22c55e" }}>
            support@ecodeli.com
          </a>
        </p>
        <p>&copy; 2025 EcoDeli. All rights reserved.</p>
      </div>
    </div>
  )
}