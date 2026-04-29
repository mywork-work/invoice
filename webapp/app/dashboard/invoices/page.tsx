"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { invoices, type Invoice } from "@/lib/api";
import {
  Receipt,
  Plus,
  Loader2,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FAILED", label: "Failed" },
];

export default function InvoicesPage() {
  const { data, isLoading } = useSWR("invoices", () => invoices.getAll());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-accent bg-accent/10";
      case "PENDING":
        return "text-yellow-500 bg-yellow-500/10";
      case "REJECTED":
      case "FAILED":
        return "text-destructive bg-destructive/10";
      case "DRAFT":
        return "text-muted-foreground bg-muted";
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
        return <XCircle className="w-4 h-4" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredInvoices = data?.invoices?.filter((invoice) => {
    const matchesSearch =
      invoice.buyerBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.fbrInvoiceNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your FBR-compliant invoices.
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Search by buyer name, invoice number..."
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none min-w-[150px]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredInvoices?.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery || statusFilter ? "No invoices found" : "No invoices yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter
              ? "Try adjusting your filters"
              : "Create your first invoice to get started."}
          </p>
          {!searchQuery && !statusFilter && (
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Invoice
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Buyer
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Tax
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices?.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-foreground font-medium font-mono text-sm">
                          {invoice.invoiceRefNo || `INV-${invoice.id}`}
                        </p>
                        {invoice.fbrInvoiceNo && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            FBR: {invoice.fbrInvoiceNo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-foreground font-medium">
                          {invoice.buyerBusinessName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {invoice.buyerProvince}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-foreground font-medium">
                        Rs {invoice.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      Rs {invoice.taxAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
