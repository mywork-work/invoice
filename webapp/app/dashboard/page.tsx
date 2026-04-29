"use client";

import useSWR from "swr";
import { business, products, invoices } from "@/lib/api";
import {
  Building2,
  Package,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: businessData, isLoading: businessLoading } = useSWR(
    "business",
    () => business.get().catch(() => null)
  );
  const { data: productsData, isLoading: productsLoading } = useSWR(
    "products",
    () => products.getAll().catch(() => ({ products: [] }))
  );
  const { data: invoicesData, isLoading: invoicesLoading } = useSWR(
    "invoices",
    () => invoices.getAll().catch(() => ({ invoices: [] }))
  );

  const isLoading = businessLoading || productsLoading || invoicesLoading;
  const hasBusiness = businessData?.data;
  const productCount = productsData?.products?.length || 0;
  const invoiceCount = invoicesData?.invoices?.length || 0;
  const totalRevenue = invoicesData?.invoices?.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0
  ) || 0;
  const approvedInvoices = invoicesData?.invoices?.filter(
    (inv) => inv.status === "APPROVED"
  ).length || 0;
  const pendingInvoices = invoicesData?.invoices?.filter(
    (inv) => inv.status === "PENDING"
  ).length || 0;

  const recentInvoices = invoicesData?.invoices?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-accent bg-accent/10";
      case "PENDING":
        return "text-yellow-500 bg-yellow-500/10";
      case "REJECTED":
      case "FAILED":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "REJECTED":
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {!hasBusiness && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Setup Your Business</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Register your business to start creating invoices with FBR integration.
              </p>
              <Link
                href="/dashboard/business"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Register Business
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground mt-1">{productCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-bold text-foreground mt-1">{invoiceCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                Rs {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {approvedInvoices} / {invoiceCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-accent" />
            </div>
          </div>
          {pendingInvoices > 0 && (
            <p className="text-xs text-yellow-500 mt-2">
              {pendingInvoices} pending
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasBusiness && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Business Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Business Name</span>
                <span className="text-sm text-foreground font-medium">
                  {businessData.data.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">NTN</span>
                <span className="text-sm text-foreground font-medium font-mono">
                  {businessData.data.ntn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Province</span>
                <span className="text-sm text-foreground font-medium">
                  {businessData.data.province}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">FBR Status</span>
                <span
                  className={`text-sm font-medium ${
                    businessData.data.isFbrEnabled ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {businessData.data.isFbrEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Invoices</h3>
            <Link
              href="/dashboard/invoices"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
              <Link
                href="/dashboard/invoices/new"
                className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
              >
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {invoice.buyerBusinessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      Rs {invoice.totalAmount.toLocaleString()}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
