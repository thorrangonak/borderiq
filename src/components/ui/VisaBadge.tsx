type VisaType =
  | "visa free"
  | "visa on arrival"
  | "eta"
  | "e-visa"
  | "visa required"
  | "no admission";

interface VisaBadgeProps {
  type: VisaType;
}

const colorMap: Record<VisaType, string> = {
  "visa free": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "visa on arrival": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "eta": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "e-visa": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "visa required": "bg-red-500/20 text-red-400 border-red-500/30",
  "no admission": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const labelMap: Record<VisaType, string> = {
  "visa free": "Visa Free",
  "visa on arrival": "Visa on Arrival",
  "eta": "ETA",
  "e-visa": "e-Visa",
  "visa required": "Visa Required",
  "no admission": "No Admission",
};

export default function VisaBadge({ type }: VisaBadgeProps) {
  const colors = colorMap[type] ?? colorMap["no admission"];
  const label = labelMap[type] ?? type;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}
    >
      {label}
    </span>
  );
}
