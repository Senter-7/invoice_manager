import React from "react";
import {
    AlertTriangle,
    Edit3,
    Check,
    CheckCircle,
    Download,
    Database,
    Archive,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { Document, ExtractedField, LineItem, AutoTag, Clause } from "./types";
import { toast } from "sonner";

interface ExtractionPanelProps {
    selectedDoc: Document;
    extractedFields: ExtractedField[];
    lineItems: LineItem[];
    tags: AutoTag[];
    clauses: Clause[];
    hoveredField: number | null;
    onFieldHover: (index: number | null) => void;
    editingField: number | null;
    onEditField: (index: number | null) => void;
    onTagToggle: (index: number) => void;
    onExport: (type: string) => void;
    onApprove: () => void;
}

export function ExtractionPanel({
    selectedDoc,
    extractedFields,
    lineItems,
    tags,
    clauses,
    hoveredField,
    onFieldHover,
    editingField,
    onEditField,
    onTagToggle,
    onExport,
    onApprove,
}: ExtractionPanelProps) {
    return (
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="glass-panel h-full flex flex-col overflow-hidden animate-slide-in-right">
                {/* Header */}
                <div className="p-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Extracted Data</h3>
                        {selectedDoc.status === "processed" && <ConfidenceBadge value={94} size="md" />}
                    </div>
                    {selectedDoc.status === "processed" ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{extractedFields.length} fields extracted</span>
                            <span className="text-warning">• 1 needs review</span>
                        </div>
                    ) : selectedDoc.status === "processing" ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground italic animate-pulse">
                            <span>Analyzing document...</span>
                        </div>
                    ) : null}
                </div>

                {/* Fields */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-3">
                        <h4 className="text-xs text-muted-foreground uppercase tracking-wider">Fields</h4>
                        {extractedFields.map((field, i) => (
                            <div
                                key={i}
                                onMouseEnter={() => onFieldHover(i)}
                                onMouseLeave={() => onFieldHover(null)}
                                className={cn(
                                    "p-3 rounded-xl border transition-all duration-200",
                                    hoveredField === i ? "bg-primary/5 border-primary/30" :
                                        field.confidence < 90 ? "bg-warning/5 border-warning/20" :
                                            "bg-secondary/50 border-border/50"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">{field.label}</p>
                                        {editingField === i ? (
                                            <div className="mt-1 flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    defaultValue={field.value}
                                                    className="w-full bg-background border border-primary rounded px-2 py-1 text-sm focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            onEditField(null);
                                                            toast.success("Field updated");
                                                        }
                                                    }}
                                                    onBlur={() => onEditField(null)}
                                                />
                                                <button
                                                    onClick={() => {
                                                        onEditField(null);
                                                        toast.success("Field updated");
                                                    }}
                                                    className="p-1 text-primary hover:bg-primary/10 rounded"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium mt-0.5">{field.value}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ConfidenceBadge value={field.confidence} size="sm" showLabel={false} />
                                        <button
                                            onClick={() => onEditField(i)}
                                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                        >
                                            <Edit3 className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                                {field.confidence < 90 && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>Low confidence - please verify</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Line Items Table */}
                    <div className="p-4 border-t border-border/50">
                        <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Line Items</h4>
                        <div className="bg-secondary/30 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border/50 text-muted-foreground">
                                        <th className="p-2 text-left">Description</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item, i) => (
                                        <tr key={i} className="border-b border-border/30 last:border-b-0">
                                            <td className="p-2 truncate max-w-[120px]">{item.description}</td>
                                            <td className="p-2 text-center">{item.quantity}</td>
                                            <td className="p-2 text-right">${item.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Auto Tags */}
                    <div data-tour="auto-tags" className="p-4 border-t border-border/50">
                        <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Auto-Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors",
                                        tag.accepted
                                            ? "bg-success/10 text-success border-success/20"
                                            : "bg-secondary text-muted-foreground border-border"
                                    )}
                                >
                                    <span>{tag.tag}</span>
                                    <button
                                        onClick={() => onTagToggle(i)}
                                        className="hover:text-foreground transition-colors p-0.5"
                                    >
                                        {tag.accepted ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clause Extraction (for contracts) */}
                    {selectedDoc.type === "contract" && (
                        <div className="p-4 border-t border-border/50">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Clause Extraction</h4>
                            <div className="space-y-2">
                                {clauses.map((clause, i) => (
                                    <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{clause.name}</span>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded uppercase",
                                                clause.risk === "low" ? "bg-success/10 text-success" :
                                                    clause.risk === "medium" ? "bg-warning/10 text-warning" :
                                                        "bg-destructive/10 text-destructive"
                                            )}>
                                                {clause.risk} risk
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{clause.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div data-tour="doc-actions" className="p-4 border-t border-border/50 space-y-2">
                    <Button
                        className="w-full gap-2 shadow-sm font-semibold h-12"
                        onClick={onApprove}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Approve & Export
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 h-10"
                            onClick={() => onExport("JSON")}
                        >
                            <Download className="h-3 w-3" />
                            JSON
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 h-10"
                            onClick={() => onExport("ERP")}
                        >
                            <Database className="h-3 w-3" />
                            ERP
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
