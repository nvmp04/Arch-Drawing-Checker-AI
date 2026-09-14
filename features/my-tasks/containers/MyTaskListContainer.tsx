import { EmptyState } from "@/shared/components/EmptyState";

export function MyTaskListContainer() {
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-text-primary">
        Việc của tôi
      </h1>
      <EmptyState message="Chưa có việc nào được giao cho bạn." />
    </section>
  );
}
