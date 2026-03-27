import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { matchingData, MatchingTransaction } from "./mockScenarios";
import { cn } from "@/lib/utils";

interface InvoiceListProps {
  onSelectInvoice: (scenarioKey: string) => void;
}

import { useState } from "react";

interface InvoiceListProps {
  onSelectInvoice: (invoiceId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function InvoiceList({ onSelectInvoice, currentPage, onPageChange }: InvoiceListProps) {
  const itemsPerPage = 5;

  // Map scenarios to a summary list
  const invoiceData = matchingData.map((data) => {
    const invoiceField = data.invoice.fields.find(f => f.label === "Invoice Number")?.value || "Unknown";
    const vendorField = data.invoice.fields.find(f => f.label === "Vendor")?.value || "Unknown";
    const dateField = data.invoice.fields.find(f => f.label === "Date")?.value || "2024-11-22";

    // Calculate total amount from line items
    const totalAmount = data.invoice.lineItems.reduce((sum, item) => sum + item.total, 0);

    // Dynamically calculate status based on actual data mismatches
    let status = "Auto-Approved";
    let statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

    const poCurrency = data.purchaseOrder.currency;
    const invCurrency = data.invoice.currency;
    const hasCurrencyMismatch = poCurrency !== invCurrency;

    let hasQtyMismatch = false;
    let hasPriceMismatch = false;
    let hasItemMismatch = false;

    // Check line items
    const maxItems = Math.max(
      data.purchaseOrder.lineItems.length,
      data.grn.lineItems.length,
      data.invoice.lineItems.length
    );

    for (let i = 0; i < maxItems; i++) {
      const poItem = data.purchaseOrder.lineItems[i];
      const grnItem = data.grn.lineItems[i];
      const invItem = data.invoice.lineItems[i];

      if (poItem && grnItem && invItem) {
        if (poItem.quantity !== grnItem.quantity || poItem.quantity !== invItem.quantity) {
          hasQtyMismatch = true;
        }

        // Price match logic (with simple conversion simulation if currencies differ)
        let convertedPoPrice = poItem.unitPrice;

        if (poCurrency !== invCurrency) {
          const ratesToINR: Record<string, number> = {
            AED: 22.72, USD: 83.50, EUR: 89.20, GBP: 104.50, SGD: 61.30, INR: 1
          };

          const poRate = ratesToINR[poCurrency] || 1;
          const invRate = ratesToINR[invCurrency] || 1;

          // Convert PO price to base INR, then to Invoice currency
          const poPriceInINR = poItem.unitPrice * poRate;
          const convertedPoPriceInInvCurrency = poPriceInINR / invRate;
          convertedPoPrice = convertedPoPriceInInvCurrency;
        }

        if (Math.abs(convertedPoPrice - invItem.unitPrice) > 1) { // 1 unit tolerance
          hasPriceMismatch = true;
        }

        if (poItem.item !== invItem.item || poItem.item !== grnItem.item) {
          hasItemMismatch = true;
        }
      } else {
        // If an item is missing in one of the docs, it's a mismatch
        hasQtyMismatch = true;
      }
    }

    if (hasCurrencyMismatch || hasPriceMismatch || hasItemMismatch|| hasQtyMismatch) {
      status = "Pending Review";
      statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }

    return {
      id: data.id,
      invoiceNumber: invoiceField,
      vendor: vendorField,
      date: dateField,
      amount: `${totalAmount.toLocaleString()} ${data.invoice.currency}`,
      status,
      statusColor
    };
  });

  const totalPages = Math.ceil(invoiceData.length / itemsPerPage);
  const paginatedData = invoiceData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Card className="flex flex-col h-full bg-background/60 backdrop-blur-md border border-border/50 shadow-xl overflow-hidden animate-fade-in">
      <CardHeader className="border-b border-border/40 bg-secondary/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Invoice Inbox
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {9} Invoices Pending
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50 bg-secondary/5">
              <TableHead className="h-10 text-xs font-semibold px-6">Invoice Number</TableHead>
              <TableHead className="h-10 text-xs font-semibold">Vendor</TableHead>
              <TableHead className="h-10 text-xs font-semibold">Date</TableHead>
              <TableHead className="h-10 text-xs font-semibold text-right">Amount</TableHead>
              <TableHead className="h-10 text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="h-10 text-xs font-semibold text-right px-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((inv) => (
              <TableRow
                key={inv.id}
                className="border-border/50 transition-colors hover:bg-secondary/20 cursor-pointer group"
                onClick={() => onSelectInvoice(inv.id)}
              >
                <TableCell className="py-3 px-6 text-sm font-medium text-foreground flex items-center gap-2">
                  {inv.invoiceNumber}
                  <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{inv.vendor}</TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{inv.date}</TableCell>
                <TableCell className="py-3 text-sm font-medium text-right">{inv.amount}</TableCell>
                <TableCell className="py-3 text-center">
                  <Badge className={cn("px-2 py-0.5 text-[10px] font-semibold", inv.statusColor)} variant="outline">
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-right px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInvoice(inv.id);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-secondary/5">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, invoiceData.length)} of {invoiceData.length} entries
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs bg-background/50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs bg-background/50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
