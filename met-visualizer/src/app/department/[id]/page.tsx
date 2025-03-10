"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from 'next/image';

interface FetchObjectsResponse {
  objectIDs: number[];
  total: number;
}

interface FetchObjectResponse {
  objectID: number;
  primaryImageSmall: string;
  title: string;
  artistDisplayName: string;
}

async function fetchObjects(departmentId: string): Promise<FetchObjectsResponse> {
  const res = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${departmentId}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch objects');
  }
  const data: FetchObjectsResponse = await res.json();
  return data;
}

async function fetchObject(objectId: number): Promise<FetchObjectResponse> {
  const res = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch object');
  }
  const data: FetchObjectResponse = await res.json();
  return data;
}

export default function DepartmentPage() {
  const params = useParams();
  const id = params.id as string;
  const [objectIDs, setObjectIDs] = useState<number[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [currentObjects, setObjects] = useState<FetchObjectResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function loadObjectIds() {
      const { objectIDs, total } = await fetchObjects(id);
      setObjectIDs(objectIDs);
      setTotalObjects(total);
    }
    loadObjectIds();
  }, [id]);

  const totalPages = Math.ceil(totalObjects / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentObjectIds = objectIDs.slice(startIdx, endIdx);

  useEffect(() => {
    async function loadObjects() {
      const objectsData = (await Promise.all(currentObjectIds.map(id => fetchObject(id)))).filter(obj => obj.primaryImageSmall);
      setObjects(objectsData);
    }
    loadObjects();
  }, [currentObjectIds]);

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
        {currentObjects.map((obj) => (
          <div key={obj.objectID} className="bg-gray-100 p-4 rounded shadow">
            <h2>{obj.title || "Untitled"}</h2>
            <h3>{obj.artistDisplayName}</h3>
            <div className="w-full max-w-xs aspect-square relative">
              <Image src={obj.primaryImageSmall} alt={obj.title} layout="fill" style={{ objectFit: "cover" }} />
            </div>
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