import Invoice from '../model/invoice.model.js';
import Business from '../model/busness.model.js';
import Product from '../model/product.model.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode';




export const createInvoice = async (req, res) => {
  try {
    console.log("\n================ CREATE INVOICE START ================\n");

    const userId = req.user.id;
    const { businessId, invoiceDate, buyer, items } = req.body;

    console.log("📥 REQUEST BODY:", JSON.stringify(req.body, null, 2));

    // ---------------- BUSINESS ----------------
    const business = await Business.findOne({
      where: { id: businessId, userId }
    });

    if (!business) {
      return res.status(400).json({ error: "Business not found" });
    }

    console.log("🏢 BUSINESS:", {
      id: business.id,
      name: business.name,
      ntn: business.ntn,
      active: business.isActive,
      fbrEnabled: business.isFbrEnabled
    });

    if (!items?.length) {
      return res.status(400).json({ error: "Items required" });
    }

    // ---------------- PRODUCTS ----------------
    const productIds = items.map(i => i.productId);

    const products = await Product.findAll({
      where: { id: productIds, userId }
    });

    const productMap = {};
    products.forEach(p => (productMap[p.id] = p));

    console.log(`📦 PRODUCTS FOUND: ${products.length}`);

    // ---------------- MAP ITEMS ----------------
    const invoiceItems = items.map((item, index) => {
      const product = productMap[item.productId];

      if (!product) throw new Error(`Product not found: ${item.productId}`);

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.price);

      const valueSalesExcludingST = Number((quantity * unitPrice).toFixed(2));
      const salesTaxApplicable = Number(
        ((valueSalesExcludingST * product.taxRate) / 100).toFixed(2)
      );

      const mapped = {
        hsCode: product.hsCode,
        productDescription: product.itemName,
        rate: `${product.taxRate}%`,
        uoM: product.uom,
        quantity,
        valueSalesExcludingST,
        fixedNotifiedValueOrRetailPrice: 0.0,
        salesTaxApplicable,
        salesTaxWithheldAtSource: 0.0,
        extraTax: 0.0,
        furtherTax: 0.0,
        fedPayable: 0.0,
        discount: 0.0,
        saleType: "Goods at standard rate (default)",
        sroScheduleNo: "",
        sroItemSerialNo: ""
      };

      console.log(`🧾 ITEM [${index}] MAPPED:`, mapped);

      return mapped;
    });

    // ---------------- TOTALS ----------------
    const totalAmount = invoiceItems.reduce(
      (acc, i) => acc + i.valueSalesExcludingST,
      0
    );

    const taxAmount = invoiceItems.reduce(
      (acc, i) => acc + i.salesTaxApplicable,
      0
    );

    console.log("\n💰 TOTALS:", { totalAmount, taxAmount });

    // ---------------- INVOICE REF ----------------
   const shortTime = Date.now().toString().slice(-5); // last 5 digits
const shortUUID = uuidv4().split('-')[0]; // first block only

const invoiceRefNo = `SB-${shortTime}-${shortUUID}`;
console.log("🔖 INVOICE REF:", invoiceRefNo);

    // ---------------- SAVE INVOICE ----------------
    const invoice = await Invoice.create({
      userId,
      businessId,
      invoiceType: "Sale Invoice",
      invoiceDate,

      sellerNTNCNIC: business.ntn,
      sellerBusinessName: business.name,
      sellerProvince: business.province,
      sellerAddress: business.address,

      buyerNTNCNIC: buyer?.buyerNTNCNIC || "",
      buyerBusinessName: buyer?.buyerBusinessName,
      buyerProvince: buyer?.buyerProvince,
      buyerAddress: buyer?.buyerAddress,
      buyerRegistrationType: buyer?.buyerRegistrationType || "Unregistered",

      invoiceRefNo,
      scenarioId: "SN001",

      totalAmount,
      taxAmount,

      status: "PENDING",
      items: invoiceItems
    });

    console.log("💾 INVOICE SAVED ID:", invoice.id);

    // =========================================================
    // 🚫 FBR DISABLED → SKIP API
    // =========================================================
    if (!business.isFbrEnabled) {
      console.log("⚠️ FBR DISABLED — Skipping API call");

      invoice.status = "APPROVED";
      invoice.fbrInvoiceNo = `LOCAL-${Date.now()}`;

      // optional QR for local invoice
      const qrData = `Invoice:${invoice.invoiceRefNo}`;
      invoice.qrCode = await QRCode.toDataURL(qrData);

      await invoice.save();

      console.log("\n================ CREATE INVOICE END (LOCAL) ================\n");

      return res.json({
        message: "Invoice created (FBR disabled)",
        fbrSent: false,
        invoice
      });
    }

    // =========================================================
    // 🚀 FBR PAYLOAD
    // =========================================================
    const fbrPayload = {
      invoiceType: "Sale Invoice",
      invoiceDate,

      sellerNTNCNIC: business.ntn,
      sellerBusinessName: business.name,
      sellerProvince: business.province,
      sellerAddress: business.address,

      buyerNTNCNIC: buyer?.buyerNTNCNIC || "",
      buyerBusinessName: buyer?.buyerBusinessName,
      buyerProvince: buyer?.buyerProvince,
      buyerAddress: buyer?.buyerAddress,
      buyerRegistrationType: buyer?.buyerRegistrationType || "Unregistered",

      invoiceRefNo,
      scenarioId: "SN001",
      items: invoiceItems
    };

    console.log("\n🚀 FINAL FBR PAYLOAD:");
    console.log(JSON.stringify(fbrPayload, null, 2));

    // ---------------- CALL FBR ----------------
    const FBR_URL = "https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata";

    try {
      const response = await axios.post(FBR_URL, fbrPayload, {
        headers: {
          Authorization: `Bearer ${business.fbrToken}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      });

      console.log("\n📡 RAW FBR RESPONSE:");
      console.log(response.data);

      const data = response.data;

      if (data?.InvoiceNumber && data.InvoiceNumber !== "Not Available") {
        invoice.fbrInvoiceNo = data.InvoiceNumber;
        invoice.status = "APPROVED";

        console.log("✅ FBR APPROVED:", data.InvoiceNumber);

        if (data.QRCode) {
          invoice.qrCode = await QRCode.toDataURL(data.QRCode);
        }
      } else {
        invoice.status = "REJECTED";
        invoice.error = JSON.stringify(data);

        console.log("❌ FBR FAILED:", data);
      }

      await invoice.save();
    } catch (err) {
      console.log("🚨 FBR ERROR:", err.response?.data || err.message);

      invoice.status = "FAILED";
      invoice.error = JSON.stringify(err.response?.data || err.message);

      await invoice.save();
    }

    console.log("\n================ CREATE INVOICE END ================\n");

    return res.json({
      message: "Invoice processed",
      fbrSent: true,
      invoice
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

///
export const getInvoices = async (req, res) => {
  try {
    const userId = req.user.id;

    const invoices = await Invoice.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']] // Newest invoices at the top
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });

  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find invoice by ID and ensure it belongs to the authenticated user
    const invoice = await Invoice.findOne({
      where: { id, userId }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};