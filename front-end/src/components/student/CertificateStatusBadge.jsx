import { Icon } from "../ui";

const CertificateStatusBadge = ({ status, size = "md" }) => {
  if (!status || status === "not_eligible") {
    return null;
  }

  const statusConfig = {
    pending: {
      icon: "clock",
      text: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
      iconColor: "#ca8a04"
    },
    approved: {
      icon: "check-circle",
      text: "Approved",
      className: "bg-green-100 text-green-700 border-green-300",
      iconColor: "#15803d"
    },
    rejected: {
      icon: "x-circle",
      text: "Rejected",
      className: "bg-red-100 text-red-700 border-red-300",
      iconColor: "#dc2626"
    }
  };

  const sizeConfig = {
    sm: {
      className: "px-2 py-0.5 text-[10px]",
      iconSize: 10
    },
    md: {
      className: "px-3 py-1.5 text-xs",
      iconSize: 14
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClass = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`flex items-center gap-1.5 rounded-lg border font-bold uppercase tracking-widest ${config.className} ${sizeClass.className}`}>
      <Icon name={config.icon} size={sizeClass.iconSize} color={config.iconColor} />
      {config.text}
    </div>
  );
};

export default CertificateStatusBadge;
