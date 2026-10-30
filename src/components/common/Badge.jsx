import "./Badge.css";

function Badge({ children, color = "#0d6efd", icon, variant = "subtle" }) {
  const dynamicStyle =
    variant === "solid"
      ? { backgroundColor: color, color: "#ffffff" }
      : {
          backgroundColor: `${color}18`, // 10% opacity
          color: color,
          borderColor: `${color}40`,
        };

  return (
    <span className={`app-badge badge-${variant}`} style={dynamicStyle}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
