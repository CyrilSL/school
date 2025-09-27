// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/pg-core";

/**
 * Fee management system schema
 */
export const createTable = pgTableCreator((name) => name);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  isPremium: boolean("is_premium").notNull().default(false),
  role: text("role").notNull().default("user"), // "admin" | "user"
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  impersonatedBy: text("impersonated_by"),
  // Better Auth organization plugin fields
  activeOrganizationId: text("active_organization_id"),
  activeTeamId: text("active_team_id"),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Organization/Institution tables
export const organization = createTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
  metadata: text("metadata"),
});

export const member = createTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = createTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  email: text("email").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id),
});

// Locations table for managing available cities/locations
export const location = createTable("location", {
  id: text("id").primaryKey(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull().default("India"),
  displayName: text("display_name").notNull(), // "Mumbai, Maharashtra" or "Delhi, Delhi"
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0), // Track how often it's used
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
}, (table) => ({
  displayNameIndex: index("location_display_name_idx").on(table.displayName),
  cityStateIndex: index("location_city_state_idx").on(table.city, table.state),
  usageCountIndex: index("location_usage_count_idx").on(table.usageCount),
}));

// Institution-specific tables
export const institution = createTable("institution", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'school' | 'college' | 'university'
  // Multiple locations support
  locations: json("locations").$type<Array<{city: string; state?: string; address?: string}>>().default([]),
  // Legacy fields for backward compatibility
  city: text("city"),
  state: text("state"),
  address: text("address"),
  // Multiple boards support
  boards: json("boards").$type<string[]>().default([]),
  // Legacy field for backward compatibility
  board: text("board"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logo: text("logo"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Fee structures and EMI plans
export const feeStructure = createTable("fee_structure", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institution.id),
  name: text("name").notNull(), // 'Tuition Fee', 'Hostel Fee', etc.
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  academicYear: text("academic_year").notNull(),
  semester: text("semester"), // optional for semester-based fees
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Platform-level EMI plans (not institution specific)
export const emiPlan = createTable("emi_plan", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // '3 months', '6 months', etc.
  installments: integer("installments").notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0.00"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("1000.00"), // Minimum fee amount for EMI eligibility
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).default("1000000.00"), // Maximum fee amount for EMI
  description: text("description"), // "No interest, pay in 3 easy installments"
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Parent-student relationships and fee selections
export const student = createTable("student", {
  id: text("id").primaryKey(),
  parentId: text("parent_id")
    .notNull()
    .references(() => user.id),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institution.id),
  
  // Step 1: Student Details
  name: text("name").notNull(), // studentName
  rollNumber: text("roll_number"), // studentRollNumber
  dateOfBirth: timestamp("date_of_birth"), // studentDateOfBirth
  class: text("class"), // studentClass
  section: text("section"), // studentSection
  previousSchool: text("previous_school"), // previousSchool
  
  // Fee Information
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }), // feeAmount
  feeType: text("fee_type"), // feeType (Tuition, Annual, etc.)
  
  // System fields
  admissionDate: timestamp("admission_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const feeApplication = createTable("fee_application", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => student.id),
  feeStructureId: text("fee_structure_id")
    .notNull()
    .references(() => feeStructure.id),
  emiPlanId: text("emi_plan_id")
    .references(() => emiPlan.id),
  status: text("status").notNull().default("platform_review"), // 'platform_review', 'approved', 'rejected', 'active', 'paid_to_institution'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(), // What parent owes to platform
  monthlyInstallment: decimal("monthly_installment", { precision: 10, scale: 2 }),
  platformPaidToInstitution: boolean("platform_paid_to_institution").default(false), // Has platform paid institution the full amount?
  institutionPaymentDate: timestamp("institution_payment_date"), // When platform paid institution
  appliedAt: timestamp("applied_at").notNull(),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by").references(() => user.id), // Platform admin who approved
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const installment = createTable("installment", {
  id: text("id").primaryKey(),
  feeApplicationId: text("fee_application_id")
    .notNull()
    .references(() => feeApplication.id),
  installmentNumber: integer("installment_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'overdue'
  paymentId: text("payment_id"), // Reference to payment gateway transaction
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Platform payments to institutions (lump sum payments)
export const institutionPayment = createTable("institution_payment", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institution.id),
  feeApplicationIds: text("fee_application_ids").notNull(), // JSON array of fee application IDs included in this payment
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"), // 'bank_transfer', 'upi', 'cheque'
  transactionId: text("transaction_id"), // Bank transaction reference
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  notes: text("notes"), // Any additional notes about the payment
  createdBy: text("created_by").references(() => user.id), // Platform admin who initiated payment
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Parent profile for onboarding information
export const parentProfile = createTable("parent_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id)
    .unique(),
  
  // Step 3: Parent PAN Details
  fullName: text("full_name"), // parentName
  panCardNumber: text("pan_card_number"), // parentPan
  phone: text("phone"), // parentPhone
  email: text("email"), // parentEmail
  address: text("address"), // parentAddress
  relationToStudent: text("relation_to_student"), // Father, Mother, Guardian, etc.
  monthlyIncome: text("monthly_income"), // Income range selection
  occupation: text("occupation"),
  employer: text("employer"),
  
  // Step 5: Personal Details
  applicantPan: text("applicant_pan"), // Same as parentPan usually
  gender: text("gender"),
  dateOfBirth: timestamp("date_of_birth"),
  maritalStatus: text("marital_status"),
  alternateEmail: text("alternate_email"), // if different from main email
  alternatePhone: text("alternate_phone"),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  spouseName: text("spouse_name"),
  educationLevel: text("education_level"),
  workExperience: text("work_experience"),
  companyType: text("company_type"),
  
  // Legacy fields (kept for backward compatibility)
  annualIncome: decimal("annual_income", { precision: 12, scale: 2 }),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  
  // Step 6: Terms & Confirmation
  termsAccepted: boolean("terms_accepted").default(false),
  privacyAccepted: boolean("privacy_accepted").default(false),
  creditCheckConsent: boolean("credit_check_consent").default(false),
  communicationConsent: boolean("communication_consent").default(false),
  
  // System fields
  isOnboardingCompleted: boolean("is_onboarding_completed").default(false),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Relations
export const feeApplicationRelations = relations(feeApplication, ({ one }) => ({
  student: one(student, {
    fields: [feeApplication.studentId],
    references: [student.id],
  }),
  feeStructure: one(feeStructure, {
    fields: [feeApplication.feeStructureId],
    references: [feeStructure.id],
  }),
  emiPlan: one(emiPlan, {
    fields: [feeApplication.emiPlanId],
    references: [emiPlan.id],
  }),
}));

export const studentRelations = relations(student, ({ one, many }) => ({
  parent: one(user, {
    fields: [student.parentId],
    references: [user.id],
  }),
  feeApplications: many(feeApplication),
}));

export const feeStructureRelations = relations(feeStructure, ({ many }) => ({
  feeApplications: many(feeApplication),
}));

export const emiPlanRelations = relations(emiPlan, ({ many }) => ({
  feeApplications: many(feeApplication),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  institutions: many(institution),
}));

export const institutionRelations = relations(institution, ({ one }) => ({
  organization: one(organization, {
    fields: [institution.organizationId],
    references: [organization.id],
  }),
}));
