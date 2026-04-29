"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { products, type Product, type CreateProductInput } from "@/lib/api";
import {
  Package,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  Search,
} from "lucide-react";

const UOM_OPTIONS = ["PCS", "KG", "LTR", "MTR", "PKT", "BOX", "SET", "PAIR"];

export default function ProductsPage() {
  const { data, isLoading, error } = useSWR("products", () => products.getAll());
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<CreateProductInput>({
    itemName: "",
    hsCode: "",
    taxRate: 17,
    uom: "PCS",
  });

  const resetForm = () => {
    setFormData({
      itemName: "",
      hsCode: "",
      taxRate: 17,
      uom: "PCS",
    });
    setEditingProduct(null);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        itemName: product.itemName,
        hsCode: product.hsCode,
        taxRate: product.taxRate,
        uom: product.uom,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await products.update({ id: editingProduct.id, ...formData });
      } else {
        await products.add(formData);
      }
      mutate("products");
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    try {
      await products.delete(id);
      mutate("products");
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = data?.products?.filter(
    (product) =>
      product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.hsCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products with HS codes and tax rates.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Search products by name or HS code..."
        />
      </div>

      {filteredProducts?.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? "No products found" : "No products yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Add your first product to get started."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Product Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    HS Code
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Tax Rate
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    UoM
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts?.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="text-foreground font-medium">
                        {product.itemName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm bg-muted px-2 py-1 rounded text-foreground font-mono">
                        {product.hsCode}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-foreground">{product.taxRate}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-muted-foreground">{product.uom}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteId === product.id}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  HS Code *
                </label>
                <input
                  type="text"
                  value={formData.hsCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hsCode: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  placeholder="e.g., 8471.30.00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tax Rate (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit of Measure *
                  </label>
                  <select
                    value={formData.uom}
                    onChange={(e) =>
                      setFormData({ ...formData, uom: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {UOM_OPTIONS.map((uom) => (
                      <option key={uom} value={uom}>
                        {uom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
