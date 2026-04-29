"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { invoices } from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
  User,
  QrCode,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useSWR(`invoice-${id}`, () =>
    invoices.getById(parseInt(id))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-accent bg-accent/10 border-accent/20";
      case "PENDING":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "REJECTED":
      case "FAILED":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5" />;
      case "PENDING":
        return <Clock className="w-5 h-5" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5" />;
      case "FAILED":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.invoice) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-foreground">Invoice not found</p>
          </div>
        </div>
      </div>
    );
  }

  const invoice = data.invoice;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/invoices"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Invoice {invoice.invoiceRefNo || `#${invoice.id}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created on {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${getStatusColor(
            invoice.status
          )}`}
        >
          {getStatusIcon(invoice.status)}
          {invoice.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seller & Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Seller</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">
                  {invoice.sellerBusinessName}
                </p>
                <p className="text-muted-foreground">{invoice.sellerAddress}</p>
                <p className="text-muted-foreground">{invoice.sellerProvince}</p>
                <p className="text-muted-foreground font-mono">
                  NTN: {invoice.sellerNTNCNIC}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Buyer</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">
                  {invoice.buyerBusinessName}
                </p>
                <p className="text-muted-foreground">{invoice.buyerAddress}</p>
                <p className="text-muted-foreground">{invoice.buyerProvince}</p>
                {invoice.buyerNTNCNIC && (
                  <p className="text-muted-foreground font-mono">
                    NTN/CNIC: {invoice.buyerNTNCNIC}
                  </p>
                )}
                <p className="text-muted-foreground">
                  Type: {invoice.buyerRegistrationType}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-foreground">Invoice Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                      HS Code
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">
                      Qty
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">
                      Rate
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">
                      Tax
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-4 px-6 text-foreground">
                        {item.productDescription}
                      </td>
                      <td className="py-4 px-6">
                        <code className="text-sm bg-muted px-2 py-1 rounded text-foreground font-mono">
                          {item.hsCode}
                        </code>
                      </td>
                      <td className="py-4 px-6 text-right text-foreground">
                        {item.quantity} {item.uoM}
                      </td>
                      <td className="py-4 px-6 text-right text-muted-foreground">
                        {item.rate}
                      </td>
                      <td className="py-4 px-6 text-right text-muted-foreground">
                        Rs {item.salesTaxApplicable?.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-foreground">
                        Rs {item.valueSalesExcludingST?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr className="border-t border-border">
                    <td colSpan={4} />
                    <td className="py-3 px-6 text-right text-sm text-muted-foreground">
                      Subtotal
                    </td>
                    <td className="py-3 px-6 text-right font-medium text-foreground">
                      Rs {invoice.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} />
                    <td className="py-3 px-6 text-right text-sm text-muted-foreground">
                      Tax
                    </td>
                    <td className="py-3 px-6 text-right font-medium text-foreground">
                      Rs {invoice.taxAmount?.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td colSpan={4} />
                    <td className="py-4 px-6 text-right text-sm font-semibold text-foreground">
                      Total
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-foreground text-lg">
                      Rs{" "}
                      {(
                        (invoice.totalAmount || 0) + (invoice.taxAmount || 0)
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Invoice Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date</span>
                <span className="text-foreground">
                  {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Type</span>
                <span className="text-foreground">{invoice.invoiceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference No</span>
                <span className="text-foreground font-mono text-xs">
                  {invoice.invoiceRefNo}
                </span>
              </div>
              {invoice.fbrInvoiceNo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FBR Invoice No</span>
                  <span className="text-foreground font-mono text-xs">
                    {invoice.fbrInvoiceNo}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scenario ID</span>
                <span className="text-foreground font-mono">
                  {invoice.scenarioId}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {invoice.qrCode && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">QR Code</h3>
              </div>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img
                  src={invoice.qrCode}
                  alt="Invoice QR Code"
                  className="w-32 h-32"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Scan to verify invoice authenticity
              </p>
            </div>
          )}

          {/* Amount Summary */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Amount Due</h3>
            <p className="text-3xl font-bold text-primary">
              Rs{" "}
              {(
                (invoice.totalAmount || 0) + (invoice.taxAmount || 0)
              ).toLocaleString()}
            </p>
            <div className="mt-4 pt-4 border-t border-primary/20 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  Rs {invoice.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="text-foreground">
                  Rs {invoice.taxAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
