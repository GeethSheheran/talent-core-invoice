export function paymentState(total: number, outstanding: number) {
  return outstanding === 0
    ? "paid"
    : outstanding < total
      ? "partial"
      : "unpaid";
}
export function isOverdue(
  state: string,
  outstanding: number,
  due: string,
  today: string,
) {
  return state === "issued" && outstanding > 0 && due < today;
}
