export function EmptyState({ message = "Chưa có dữ liệu." }: { message?: string }) {
  return <p className="text-sm text-text-muted">{message}</p>;
}
