import { TRACKING_STEPS, stepIndex } from "@/lib/notifications";
import { Check } from "lucide-react";

const OrderTimeline = ({ status }: { status: string }) => {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
        This order was cancelled.
      </div>
    );
  }
  const current = stepIndex(status);

  return (
    <ol className="space-y-0">
      {TRACKING_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                  done ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              {i < TRACKING_STEPS.length - 1 && (
                <span className={`w-0.5 flex-1 min-h-[1.25rem] ${i < current ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
            <div className={`pb-4 ${active ? "text-foreground font-semibold" : done ? "text-foreground" : "text-muted-foreground"}`}>
              <p className="font-body text-sm">{step.label}</p>
              {active && <p className="font-body text-[11px] text-primary mt-0.5">Current status</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTimeline;
