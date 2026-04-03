import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

type Todo = {
  id: string | number;
  name: string;
};

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, name");

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <p className="text-sm text-red-600">
          No se pudieron cargar los todos: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Supabase Todos</h1>
      <ul className="space-y-3">
        {todos?.map((todo: Todo) => (
          <li key={todo.id} className="rounded-lg border px-4 py-3">
            {todo.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
