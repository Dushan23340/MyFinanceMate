import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .min(3, "Account name must be at least 3 characters long")
    .max(50, "Account name must not exceed 50 characters"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid balance format")
    .refine((val) => parseFloat(val) >= 0, {
      message: "Initial balance cannot be negative",
    }),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .string()
      .min(1, "Amount is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
      .refine((val) => parseFloat(val) > 0, {
        message: "Amount must be a positive value",
      }),
    description: z
      .string()
      .min(1, "Description is required")
      .max(100, "Description must not exceed 100 characters"),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });
