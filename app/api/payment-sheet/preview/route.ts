import { NextRequest, NextResponse } from "next/server";
import { renderPaymentSheetHTML } from "@/lib/paymentSheetTemplate";
import { PaymentSheetParams } from "@/types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const params: PaymentSheetParams = {
    fileNo: sp.get("fileNo") || "",
    surname: sp.get("surname") || "",
    firstName: sp.get("firstName") || "",
    school: sp.get("school") || "",
    staffInitial: sp.get("staffInitial") || process.env.STAFF_INITIAL || "JMP",
    paymentReceiveDate: sp.get("paymentReceiveDate") || "",
    paymentRegisterDate: sp.get("paymentRegisterDate") || "",
    tuitionFeeAmount: parseFloat(sp.get("tuitionFeeAmount") || "0"),
    amountReceive: parseFloat(sp.get("amountReceive") || "0"),
    paymentType: (sp.get("paymentType") as PaymentSheetParams["paymentType"]) || "DD",
    balance: sp.get("balance") ? parseFloat(sp.get("balance")!) : null,
    receiptNo: sp.get("receiptNo") || "",
    vtoNo: sp.get("vtoNo") || "",
    paymentNo: sp.get("paymentNo") || "",
    paymentDueDate: sp.get("paymentDueDate") || "",
    dob: sp.get("dob") || "",
    contactNo: sp.get("contactNo") || "",
    course: sp.get("course") || "",
    comment: sp.get("comment") || "",
  };

  const html = renderPaymentSheetHTML(params);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
