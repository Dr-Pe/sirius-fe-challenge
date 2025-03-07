import Image from "next/image";

type Department = {
  departmentId: number;
  displayName: string;
};

async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments');
  if (!res.ok) {
    throw new Error('Failed to fetch departments');
  }
  const data = await res.json();
  return data.departments;
}

export default async function Home() {
  const departments = await fetchDepartments();

  return (
    <div className="min-h-screen flex flex-col items-center p-8 sm:p-20">
      {/* Header */}
      <header className="w-full flex justify-center py-4">
        <h1 className="text-2xl font-bold">Centered Header</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {departments.map((department) => (
          <div key={department.departmentId} className="bg-gray-100 p-4 rounded shadow">
            {department.displayName}
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-center py-4">
        <p className="text-sm">Footer Content</p>
      </footer>
    </div>
  );
}
