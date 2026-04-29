"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  business,
  products,
  invoices,
  type CreateInvoiceInput,
  type Product,
} from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
];

interface InvoiceItem {
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: businessData, isLoading: businessLoading } = useSWR("business", () =>
    business.get().catch(() => null)
  );
  const { data: productsData, isLoading: productsLoading } = useSWR("products", () =>
    products.getAll()
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [buyer, setBuyer] = useState({
    buyerNTNCNIC: "",
    buyerBusinessName: "",
    buyerProvince: "",
    buyerAddress: "",
    buyerRegistrationType: "Unregistered",
  });

  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: 0, quantity: 1, price: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { productId: 0, quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "productId") {
      const product = productsData?.products?.find((p) => p.id === value);
      newItems[index].product = product;
    }
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const product = productsData?.products?.find((p) => p.id === item.productId);
      const taxRate = product?.taxRate || 0;
      return sum + (item.quantity * item.price * taxRate) / 100;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!businessData?.data) {
      setError("Please register your business first");
      return;
    }

    const validItems = items.filter((item) => item.productId > 0);
    if (validItems.length === 0) {
      setError("Please add at least one product");
      return;
    }

    setIsSubmitting(true);

    try {
      const invoiceData: CreateInvoiceInput = {
        businessId: businessData.data.id,
        invoiceDate,
        buyer,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await invoices.create(invoiceData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/invoices");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = businessLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!businessData?.data) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Business Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You need to register your business before creating invoices.
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
            Invoice Created!
          </h2>
          <p className="text-muted-foreground">
            Redirecting to invoices...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/invoices"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create a new FBR-compliant invoice.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seller Info (Read-only) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Seller Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Name</span>
                <span className="text-foreground font-medium">
                  {businessData.data.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NTN</span>
                <span className="text-foreground font-mono">
                  {businessData.data.ntn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Province</span>
                <span className="text-foreground">{businessData.data.province}</span>
              </div>
            </div>
          </div>

          {/* Invoice Date */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Invoice Details</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Buyer Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Buyer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={buyer.buyerBusinessName}
                onChange={(e) =>
                  setBuyer({ ...buyer, buyerBusinessName: e.target.value })
                }
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Buyer business name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                NTN/CNIC
              </label>
              <input
                type="text"
                value={buyer.buyerNTNCNIC}
                onChange={(e) =>
                  setBuyer({ ...buyer, buyerNTNCNIC: e.target.value })
                }
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                placeholder="Buyer NTN or CNIC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Province *
              </label>
              <select
                value={buyer.buyerProvince}
                onChange={(e) =>
                  setBuyer({ ...buyer, buyerProvince: e.target.value })
                }
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
                Registration Type
              </label>
              <select
                value={buyer.buyerRegistrationType}
                onChange={(e) =>
                  setBuyer({ ...buyer, buyerRegistrationType: e.target.value })
                }
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Unregistered">Unregistered</option>
                <option value="Registered">Registered</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Address *
              </label>
              <textarea
                value={buyer.buyerAddress}
                onChange={(e) =>
                  setBuyer({ ...buyer, buyerAddress: e.target.value })
                }
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={2}
                placeholder="Buyer address"
                required
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Product
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(index, "productId", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value={0}>Select product</option>
                    {productsData?.products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.itemName} ({product.hsCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Unit Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, "price", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-foreground">
                      Rs {(item.quantity * item.price).toLocaleString()}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">
                    Rs {calculateSubtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground font-medium">
                    Rs {calculateTax().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    Rs {(calculateSubtotal() + calculateTax()).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/invoices"
            className="px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Invoice"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
