export function StatusBadge({ state }: { state: string }) {
  return <span className={"badge " + state}>{state.replaceAll("-", " ")}</span>;
}
