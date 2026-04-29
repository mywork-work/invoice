"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { business, type CreateBusinessInput } from "@/lib/api";
import {
  Building2,
  Loader2,
  Check,
  MapPin,
  FileText,
  Key,
  Terminal,
} from "lucide-react";

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
];

export default function BusinessPage() {
  const { data, isLoading, error } = useSWR("business", () =>
    business.get().catch(() => null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateBusinessInput>({
    name: "",
    ntn: "",
    address: "",
    province: "",
    fbrToken: "",
    posId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await business.create(formData);
      setSuccess(true);
      mutate("business");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to register business");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasBusiness = data?.data;

  if (hasBusiness) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Details</h1>
          <p className="text-muted-foreground mt-1">
            Your registered business information.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {data.data.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                NTN: {data.data.ntn}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-foreground">{data.data.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Province</p>
                <p className="text-foreground">{data.data.province}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">FBR Integration</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      data.data.isFbrEnabled
                        ? "bg-accent/10 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {data.data.isFbrEnabled ? (
                      <>
                        <Check className="w-3 h-3" /> Enabled
                      </>
                    ) : (
                      "Disabled"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {data.data.posId && (
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">POS ID</p>
                  <p className="text-foreground font-mono">{data.data.posId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Business Registered!
          </h2>
          <p className="text-muted-foreground">
            Your business has been successfully registered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Register Business</h1>
        <p className="text-muted-foreground mt-1">
          Register your business to start creating FBR-compliant invoices.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl">
        {submitError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter business name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              NTN (National Tax Number) *
            </label>
            <input
              type="text"
              value={formData.ntn}
              onChange={(e) => setFormData({ ...formData, ntn: e.target.value })}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="Enter NTN number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Province *
            </label>
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select province</option>
              {PAKISTAN_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter complete business address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              FBR Token *
            </label>
            <input
              type="text"
              value={formData.fbrToken}
              onChange={(e) => setFormData({ ...formData, fbrToken: e.target.value })}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="Enter FBR API token"
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Get your FBR token from the FBR portal
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              POS ID (Optional)
            </label>
            <input
              type="text"
              value={formData.posId}
              onChange={(e) => setFormData({ ...formData, posId: e.target.value })}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="Enter POS ID if applicable"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Business"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
