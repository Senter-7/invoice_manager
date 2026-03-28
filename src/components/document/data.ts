import { Document, ExtractedField, LineItem, AutoTag, Clause } from "./types";

export const sampleDocuments: Document[] = [];

export const initialExtractedFields: ExtractedField[] = [];

export const lineItems: LineItem[] = [];

export const initialAutoTags: AutoTag[] = [];

export const clauses: Clause[] = [
    { name: "Payment Terms", summary: "Net 30 days from invoice date", risk: "low" },
    { name: "Late Fee", summary: "1.5% monthly interest on overdue amounts", risk: "medium" },
    { name: "Governing Law", summary: "State of Delaware, USA", risk: "low" },
];
