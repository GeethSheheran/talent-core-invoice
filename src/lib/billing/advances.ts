export function remainingProjectCharge(total: number, issuedCharges: number) {
  if (issuedCharges > total || issuedCharges < 0)
    throw new Error("Invalid project charges");
  return total - issuedCharges;
}
