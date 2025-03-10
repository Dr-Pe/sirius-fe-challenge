"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

async function fetchObjects(departmentId: string): Promise<number[]> {
  const res = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${departmentId}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch objects');
  }
  const data: { objectIDs: number[] } = await res.json();
  return data.objectIDs;
}

export default function DepartmentPage() {
  const params = useParams();
  const id = params.id as string;
  const [objectIds, setObjectIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    async function loadObjects() {
      const fetchedObjectIds = await fetchObjects(id);
      setObjectIds(fetchedObjectIds);
    }
    loadObjects();
  }, [id]);

  const totalPages = Math.ceil(objectIds.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentObjectIds = objectIds.slice(startIdx, endIdx);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 sm:p-20">
      {/* Header */}
      <header className="w-full flex justify-center py-4">
        <h1 className="text-2xl font-bold">{id}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {currentObjectIds.map((id) => (
          <div key={id} className="bg-gray-100 p-4 rounded shadow">
            {id}
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-between py-4">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
        <p className="text-sm">Page {currentPage} of {totalPages}</p>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
      </footer>
    </div>
  );
}