import { z } from "zod";

// --- Base Schemas ---

export const errorSchema = z.object({
  message: z.string(),
});
export type Error = z.infer<typeof errorSchema>;

export const leaseSchema = z.object({
  id: z.string().min(1, "ID is required"),
  apartmentId: z.string().min(1, "Apartment ID is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional(), // Leases created before start dates were recorded have none
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  noticeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Notice date must be YYYY-MM-DD"),
  currentRent: z.string().regex(/^\d+(\.\d{1,2})?$/, "Current rent must be a valid number string"),
  propertyId: z.string().min(1, "Property ID is required"),
  nextActorEmail: z.string().email("Invalid email format").optional(),
  moveOutConfirmedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "This field must be a valid datetime").optional(),
  turnoverId: z.string().min(1, "Turnover ID is required"),
  tenantName: z.string().min(1, "Tenant name is required"),
});
export type Lease = z.infer<typeof leaseSchema>;

export const turnoverSchema = z.object({
  id: z.string().min(1, "ID is required"),
  leaseId: z.string().min(1, "Lease ID is required"),
  apartmentId: z.string().min(1, "Apartment ID is required"),
  targetReadyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target ready date must be YYYY-MM-DD"),
  propertyId: z.string().min(1, "Property ID is required"),
  nextActorEmail: z.string().email("Invalid email format").optional(),
  vacatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "This field must be a valid datetime").optional(),
  keysReturned: z.string().regex(/^(true|false)$/i, "Keys returned must be 'true' or 'false'").optional(),
  notes: z.string().optional(),
  readyToRentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ready to rent date must be YYYY-MM-DD").optional(),
  listingReady: z.string().regex(/^(true|false)$/i, "Listing ready must be 'true' or 'false'").optional(),
  marketingEmail: z.string().email("Invalid email format").optional(),
  finalInspectionPassedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "This field must be a valid datetime").optional(),
  openWorkOrdersCount: z.string().regex(/^\d+$/, "Open work orders count must be a number string").optional(),
  leaseEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Lease end date must be YYYY-MM-DD").optional(),
  checklist: z.string().optional(),
});
export type Turnover = z.infer<typeof turnoverSchema>;

export const inspectionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  turnoverId: z.string().min(1, "Turnover ID is required"),
  apartmentId: z.string().min(1, "Apartment ID is required"),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "This field must be a valid datetime"),
  assignedToEmail: z.string().email("Invalid email format").optional(),
  inspectorName: z.string().min(1, "Inspector name is required"),
  locationNotes: z.string().optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "This field must be a valid datetime").optional(),
  findingsSummary: z.string().min(1, "Findings summary is required").optional(), // Mark optional due to spec ambiguity in required for POST vs GET
  hasDamages: z.string().regex(/^(true|false)$/i, "Has damages must be 'true' or 'false'").optional(), // Mark optional due to spec ambiguity
  photosUrl: z.string().url("Photos URL must be a valid URL").optional(),
  passedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "This field must be a valid datetime").optional(), // Mark optional due to spec ambiguity
  certificateUrl: z.string().url("Certificate URL must be a valid URL").optional(),
  checklist: z.string().optional(),
});
export type Inspection = z.infer<typeof inspectionSchema>;

export const renovationReportSchema = z.object({
  id: z.string().min(1, "ID is required"),
  turnoverId: z.string().min(1, "Turnover ID is required"),
  inspectionId: z.string().min(1, "Inspection ID is required"),
  apartmentId: z.string().min(1, "Apartment ID is required"),
  damageSeverity: z.string().min(1, "Damage severity is required"),
  estimatedRepairCost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estimated repair cost must be a valid number string"),
  damageSummary: z.string().min(1, "Damage summary is required"),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type RenovationReport = z.infer<typeof renovationReportSchema>;

export const renovationCaseSchema = z.object({
  id: z.string().min(1, "ID is required"),
  turnoverId: z.string().min(1, "Turnover ID is required"),
  apartmentId: z.string().min(1, "Apartment ID is required"),
  requestedLevels: z.string().optional(),
  scopeNotes: z.string().optional(),
  targetReadyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target ready date must be YYYY-MM-DD").optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
  costGood: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost good must be a valid number string").optional(),
  costBetter: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost better must be a valid number string").optional(),
  costPremium: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost premium must be a valid number string").optional(),
  leadDaysGood: z.string().regex(/^\d+$/, "Lead days good must be a number string").optional(),
  leadDaysBetter: z.string().regex(/^\d+$/, "Lead days better must be a number string").optional(),
  leadDaysPremium: z.string().regex(/^\d+$/, "Lead days premium must be a number string").optional(),
  selectedLevel: z.string().optional(),
  budgetApproved: z.string().regex(/^(true|false)$/i, "Budget approved must be 'true' or 'false'").optional(),
  expectedCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected completion date must be YYYY-MM-DD").optional(),
  currentRent: z.string().regex(/^\d+(\.\d{1,2})?$/, "Current rent must be a valid number string").optional(),
  projectedRent: z.string().regex(/^\d+(\.\d{1,2})?$/, "Projected rent must be a valid number string").optional(),
  decisionReason: z.string().optional(),
});
export type RenovationCase = z.infer<typeof renovationCaseSchema>;

export const workOrderSchema = z.object({
  id: z.string().min(1, "ID is required"),
  renovationCaseId: z.string().min(1, "Renovation Case ID is required"),
  turnoverId: z.string().min(1, "Turnover ID is required"),
  apartmentId: z.string().min(1, "Apartment ID is required"),
  scopeSummary: z.string().min(1, "Scope summary is required"),
  accessDetails: z.string().optional(),
  materialsList: z.string().min(1, "Materials list is required"),
  nextActorEmail: z.string().email("Invalid email format").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional(), // Made optional due to ambiguity in spec between creation and update
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional(), // Made optional due to ambiguity in spec between creation and update
  crewName: z.string().min(1, "Crew name is required").optional(), // Made optional due to ambiguity
  assignedToEmail: z.string().email("Invalid email format").optional(), // Made optional due to ambiguity
  materialsReady: z.string().regex(/^(true|false)$/i, "Materials ready must be 'true' or 'false'").optional(),
  actualStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Actual start date must be YYYY-MM-DD").optional(),
  actualEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Actual end date must be YYYY-MM-DD").optional(),
  completionNotes: z.string().optional(),
  photosUrl: z.string().url("Photos URL must be a valid URL").optional(),
  varianceNotes: z.string().optional(),
});
export type WorkOrder = z.infer<typeof workOrderSchema>;

export const apartmentSchema = z.object({
  id: z.string().min(1, "ID is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  floorAreaSqm: z.string().regex(/^\d+(\.\d{1,2})?$/, "Floor area must be a valid number string"),
  bedrooms: z.string().regex(/^\d+$/, "Bedrooms must be a number string"),
  status: z.string().min(1, "Status is required"),
});
export type Apartment = z.infer<typeof apartmentSchema>;

export const propertySchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  managerName: z.string().min(1, "Manager name is required"),
  managerEmail: z.string().email("Invalid email format"),
  unitsCount: z.string().regex(/^\d+$/, "Units count must be a number string"),
});
export type Property = z.infer<typeof propertySchema>;

export const paymentMethods = ["BankTransfer", "Card", "Cash"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const rentChargeSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  propertyId: z.string(),
  apartmentId: z.string(),
  tenantName: z.string(),
  month: z.string(), // YYYY-MM
  dueDate: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  daysCharged: z.number(),
  daysInMonth: z.number(),
  monthlyRent: z.number(),
  amount: z.number(),
  amountPaid: z.number(),
  creditApplied: z.number(),
  issuedAt: z.string(),
  waivedAt: z.string().optional(),
  waivedReason: z.string().optional(),
  waivedAmount: z.number().optional(),
  owed: z.number(),
  overdueFrom: z.string(),
  isOverdue: z.boolean(),
  status: z.enum(["Unpaid", "Part paid", "Overdue", "Paid", "Waived"]),
});
export type RentCharge = z.infer<typeof rentChargeSchema>;

export const rentPaymentSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  propertyId: z.string(),
  apartmentId: z.string(),
  tenantName: z.string(),
  amount: z.number(),
  paidOn: z.string(),
  method: z.enum(paymentMethods),
  allocations: z.array(z.object({ chargeId: z.string(), month: z.string(), amount: z.number() })),
  creditAmount: z.number(),
  recordedAt: z.string(),
});
export type RentPayment = z.infer<typeof rentPaymentSchema>;

export const leaseBalanceSchema = z.object({
  leaseId: z.string(),
  tenantName: z.string(),
  propertyId: z.string(),
  apartmentId: z.string(),
  owed: z.number(),
  overdue: z.number(),
  credit: z.number(),
  isOverdue: z.boolean(),
});
export type LeaseBalance = z.infer<typeof leaseBalanceSchema>;

export const rentSummarySchema = z.object({
  asOf: z.string(),
  totalOutstanding: z.number(),
  totalOverdue: z.number(),
  overdueLeaseCount: z.number(),
});
export type RentSummary = z.infer<typeof rentSummarySchema>;

export const issueRentChargesResultSchema = z.object({
  month: z.string(),
  issued: z.array(rentChargeSchema.omit({ owed: true, overdueFrom: true, isOverdue: true, status: true })),
  refused: z.array(z.object({ leaseId: z.string(), tenantName: z.string(), reason: z.string() })),
});
export type IssueRentChargesResult = z.infer<typeof issueRentChargesResultSchema>;

// --- Request Schemas ---

export const scheduleLeaseEndRequestSchema = leaseSchema.pick({
  id: true,
  apartmentId: true,
  endDate: true,
  noticeDate: true,
  currentRent: true,
}).extend({
  nextActorEmail: z.string().email("Invalid email format").optional(), // Explicitly allow optional for request if not explicitly required
});
export type ScheduleLeaseEndRequest = z.infer<typeof scheduleLeaseEndRequestSchema>;

export const createTurnoverRequestSchema = turnoverSchema.pick({
  leaseId: true,
  apartmentId: true,
  targetReadyDate: true,
  propertyId: true,
}).extend({
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type CreateTurnoverRequest = z.infer<typeof createTurnoverRequestSchema>;

export const createLeaseRequestSchema = leaseSchema.pick({
  apartmentId: true,
  currentRent: true,
  tenantName: true,
  nextActorEmail: true,
}).extend({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type CreateLeaseRequest = z.infer<typeof createLeaseRequestSchema>;

export const scheduleInspectionRequestSchema = inspectionSchema.pick({
  turnoverId: true,
  apartmentId: true,
  scheduledAt: true,
}).extend({
  assignedToEmail: z.string().email("Invalid email format").optional(),
  locationNotes: z.string().optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type ScheduleInspectionRequest = z.infer<typeof scheduleInspectionRequestSchema>;

export const markLeaseEndedRequestSchema = leaseSchema.pick({
  id: true,
  apartmentId: true,
  endDate: true,
  moveOutConfirmedAt: true,
  turnoverId: true,
}).extend({
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type MarkLeaseEndedRequest = z.infer<typeof markLeaseEndedRequestSchema>;

export const recordApartmentVacatedRequestSchema = turnoverSchema.pick({
  id: true,
  apartmentId: true,
  vacatedAt: true,
  keysReturned: true,
}).extend({
  notes: z.string().optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type RecordApartmentVacatedRequest = z.infer<typeof recordApartmentVacatedRequestSchema>;

export const completeInspectionRequestSchema = inspectionSchema.pick({
  id: true,
  turnoverId: true,
  apartmentId: true,
  completedAt: true,
  findingsSummary: true,
  hasDamages: true,
}).extend({
  photosUrl: z.string().url("Photos URL must be a valid URL").optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type CompleteInspectionRequest = z.infer<typeof completeInspectionRequestSchema>;

export const createRenovationReportRequestSchema = renovationReportSchema.pick({
  turnoverId: true,
  inspectionId: true,
  apartmentId: true,
  damageSeverity: true,
  estimatedRepairCost: true,
  damageSummary: true,
}).extend({
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type CreateRenovationReportRequest = z.infer<typeof createRenovationReportRequestSchema>;

export const requestRenovationEstimateRequestSchema = renovationCaseSchema.pick({
  turnoverId: true,
  apartmentId: true,
}).extend({
  requestedLevels: z.string().optional(),
  scopeNotes: z.string().optional(),
  targetReadyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target ready date must be YYYY-MM-DD").optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type RequestRenovationEstimateRequest = z.infer<typeof requestRenovationEstimateRequestSchema>;

export const provideRenovationEstimateRequestSchema = renovationCaseSchema.pick({
  id: true,
}).extend({
  costGood: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost good must be a valid number string").optional(),
  costBetter: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost better must be a valid number string").optional(),
  costPremium: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost premium must be a valid number string").optional(),
  leadDaysGood: z.string().regex(/^\d+$/, "Lead days good must be a number string").optional(),
  leadDaysBetter: z.string().regex(/^\d+$/, "Lead days better must be a number string").optional(),
  leadDaysPremium: z.string().regex(/^\d+$/, "Lead days premium must be a number string").optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type ProvideRenovationEstimateRequest = z.infer<typeof provideRenovationEstimateRequestSchema>;

export const selectRenovationPlanRequestSchema = renovationCaseSchema.pick({
  id: true,
  apartmentId: true,
}).extend({
  selectedLevel: z.string().optional(),
  budgetApproved: z.string().regex(/^(true|false)$/i, "Budget approved must be 'true' or 'false'").optional(),
  expectedCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected completion date must be YYYY-MM-DD").optional(),
  projectedRent: z.string().regex(/^\d+(\.\d{1,2})?$/, "Projected rent must be a valid number string").optional(),
  decisionReason: z.string().optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type SelectRenovationPlanRequest = z.infer<typeof selectRenovationPlanRequestSchema>;

export const createWorkOrderRequestSchema = workOrderSchema.pick({
  renovationCaseId: true,
  turnoverId: true,
  apartmentId: true,
  scopeSummary: true,
  materialsList: true,
}).extend({
  accessDetails: z.string().optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type CreateWorkOrderRequest = z.infer<typeof createWorkOrderRequestSchema>;

export const scheduleWorkOrderRequestSchema = workOrderSchema.pick({
  id: true,
  apartmentId: true,
  startDate: true,
  endDate: true,
  crewName: true,
  assignedToEmail: true,
}).extend({
  materialsReady: z.string().regex(/^(true|false)$/i, "Materials ready must be 'true' or 'false'").optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type ScheduleWorkOrderRequest = z.infer<typeof scheduleWorkOrderRequestSchema>;

export const completeWorkOrderRequestSchema = workOrderSchema.pick({
  id: true,
  apartmentId: true,
  actualStartDate: true,
  actualEndDate: true,
  completionNotes: true,
}).extend({
  photosUrl: z.string().url("Photos URL must be a valid URL").optional(),
  varianceNotes: z.string().optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type CompleteWorkOrderRequest = z.infer<typeof completeWorkOrderRequestSchema>;

export const passFinalInspectionRequestSchema = inspectionSchema.pick({
  id: true,
  turnoverId: true,
  apartmentId: true,
  passedAt: true,
  inspectorName: true,
}).extend({
  certificateUrl: z.string().url("Certificate URL must be a valid URL").optional(),
  nextActorEmail: z.string().email("Invalid email format").optional(),
});
export type PassFinalInspectionRequest = z.infer<typeof passFinalInspectionRequestSchema>;

export const completeTurnoverRequestSchema = turnoverSchema.pick({
  id: true,
  readyToRentDate: true,
  apartmentId: true,
}).extend({
  listingReady: z.string().regex(/^(true|false)$/i, "Listing ready must be 'true' or 'false'").optional(),
  marketingEmail: z.string().email("Invalid email format").optional(),
  notes: z.string().optional(),
});
export type CompleteTurnoverRequest = z.infer<typeof completeTurnoverRequestSchema>;

export const createPropertyRequestSchema = propertySchema.pick({
  name: true,
  address: true,
  managerName: true,
  managerEmail: true,
  unitsCount: true,
});
export type CreatePropertyRequest = z.infer<typeof createPropertyRequestSchema>;

export const createApartmentRequestSchema = apartmentSchema.pick({
  propertyId: true,
  unitNumber: true,
  floorAreaSqm: true,
  bedrooms: true,
  status: true,
});
export type CreateApartmentRequest = z.infer<typeof createApartmentRequestSchema>;

export const issueRentChargesRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
});
export type IssueRentChargesRequest = z.infer<typeof issueRentChargesRequestSchema>;

export const recordRentPaymentRequestSchema = z.object({
  leaseId: z.string().min(1, "Lease is required"),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number string")
    .refine((amount) => Number(amount) > 0, "Amount must be more than 0"),
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Paid on must be YYYY-MM-DD"),
  method: z.enum(paymentMethods),
});
export type RecordRentPaymentRequest = z.infer<typeof recordRentPaymentRequestSchema>;

export const waiveRentChargeRequestSchema = z.object({
  id: z.string().min(1, "Charge ID is required"),
  reason: z.string().trim().min(1, "A reason is required"),
});
export type WaiveRentChargeRequest = z.infer<typeof waiveRentChargeRequestSchema>;
