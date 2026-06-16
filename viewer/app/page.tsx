import { getTextbookSummaries } from "@/lib/content";
import TextbookSearch from "@/components/TextbookSearch";

export default function Home() {
  const textbooks = getTextbookSummaries();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-grad inline-block text-3xl font-bold">教材一覧</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          自動生成された教材を選んで学習を始めましょう。
        </p>
      </header>

      {textbooks.length === 0 ? (
        <p className="text-[var(--muted)]">
          一覧に表示する教材はまだありません(unlisted の教材は直接リンクからアクセスできます)。
        </p>
      ) : (
        <TextbookSearch textbooks={textbooks} />
      )}
    </main>
  );
}
