import "./StatCard.css";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "primary", // primary | success | danger | warning
  badge,
}) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-content">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-value">{value}</div>
        {subtitle && <span className="stat-card-sub">{subtitle}</span>}
      </div>
      <div className="stat-card-icon-wrap">
        <span className="stat-icon">{icon}</span>
        {badge && <div className="stat-card-badge">{badge}</div>}
      </div>
    </div>
  );
}

export default StatCard;
