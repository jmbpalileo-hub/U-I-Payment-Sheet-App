export interface Student {
  fileNo: string;
  surname: string;
  firstName: string;
  school: string;
  dateRegistered: string;
  staffInitial: string;
}

export type PaymentType = "DD" | "EFTPOS" | "CCCF" | "Cash" | "CHQ" | "C/Card";

export interface PaymentFormData {
  paymentReceiveDate: string;
  paymentRegisterDate: string;
  tuitionFeeAmount: number;
  amountReceive: number;
  paymentType: PaymentType;
  balance: number | null;
  receiptNo: string;
  vtoNo: string;
  paymentNo: string;
  paymentDueDate: string;
  dob: string;
  contactNo: string;
  course: string;
  comment: string;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  folderName: string;
  driveUrl: string;
}

export type ActionStatus = "idle" | "loading" | "success" | "error";

export interface ActionState {
  status: ActionStatus;
  message?: string;
  errorMessage?: string;
  result?: UploadResult | { draftId: string };
  progressText?: string;
}

export interface PaymentSheetParams extends PaymentFormData {
  fileNo: string;
  school: string;
  surname: string;
  firstName: string;
  staffInitial: string;
}
