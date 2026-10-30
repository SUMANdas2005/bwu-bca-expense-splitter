import "./Card.css";

function Card({
  title,
  subtitle,
  icon,
  action,
  children,
  className = "",
  style = {},
}) {
  return (
    <div className={`app-card ${className}`} style={style}>
      {(title || action) && (
        <div className="card-header">
          <div className="card-title-group">
            {icon && <span className="card-header-icon">{icon}</span>}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

export default Card;
