"use client";

import { Check } from "lucide-react";
import {
  useGetBillingStatusQuery,
  type IWorkspace,
} from "@/redux/api/workspaceApi";
import { useWorkspace } from "@/context/WorkspaceContext";

type BillingPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  features: string[];
  active: boolean;
};

type BillingStatus = {
  isFreeProduct: boolean;
  billingEnabled: boolean;
  currentPlan: string;
  message: string;
  plans: BillingPlan[];
};

export default function PlanPage() {
  const { workspace } = useWorkspace();
  const { data, isLoading, isError, refetch } = useGetBillingStatusQuery(
    undefined,
  );

  const status = (data?.data ?? null) as BillingStatus | null;

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Account
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
          Plan
        </h1>
        <p className="mt-2 text-sm text-muted">
          Everything in this product is free. Billing APIs are wired so a paid
          tier can turn on later without redesigning the app.
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton h-48 max-w-xl rounded-2xl" />
      ) : isError || !status ? (
        <div className="rounded-2xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm">
          Couldn’t load plan status.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-ink/10 bg-ink p-6 text-paper md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Current plan
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold capitalize">
              {status.currentPlan}
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/70">
              {status.message}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink">
                {status.isFreeProduct ? "Free forever" : "Paid ready"}
              </span>
              <span className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80">
                Billing {status.billingEnabled ? "enabled" : "stubbed"}
              </span>
              {workspace ? (
                <span className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80">
                  {(workspace as IWorkspace).name}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            {(status.plans || []).map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border px-5 py-4 ${
                  plan.active
                    ? "border-accent-deep/40 bg-accent/20"
                    : "border-ink/10 bg-white opacity-70"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {plan.name}
                  </h3>
                  <p className="text-sm font-semibold text-ink">
                    ${plan.priceMonthly}
                    <span className="text-muted">/mo</span>
                  </p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-ink/80"
                    >
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-accent-deep"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.active ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent-deep">
                    Active
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-muted">
                    Coming later — not charged
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
