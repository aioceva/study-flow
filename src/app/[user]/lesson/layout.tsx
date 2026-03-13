import { Suspense } from "react";
import LessonLayoutInner from "./LessonLayoutInner";

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen">{children}</div>}>
      <LessonLayoutInner>{children}</LessonLayoutInner>
    </Suspense>
  );
}
