import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "md",
  icon = null,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style = {},
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`app-btn btn-${variant} btn-${size} ${className}`}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;
