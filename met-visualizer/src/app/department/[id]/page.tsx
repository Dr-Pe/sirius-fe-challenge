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
  department: string;
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

  useEffect(() => {
    async function loadObjects() {
      let objectsData: FetchObjectResponse[] = [];
      let startIdx = (currentPage - 1) * itemsPerPage;
      let endIdx = startIdx + itemsPerPage;

      while (objectsData.length < itemsPerPage && startIdx < objectIDs.length) {
        const currentObjectIds = objectIDs.slice(startIdx, endIdx);
        const fetchedObjects = await Promise.all(currentObjectIds.map(id => fetchObject(id)));
        const validObjects = fetchedObjects.filter(obj => obj.primaryImageSmall);
        objectsData = [...objectsData, ...validObjects];
        startIdx = endIdx;
        endIdx = startIdx + itemsPerPage;
      }

      setObjects(objectsData.slice(0, itemsPerPage));
    }
    loadObjects();
  }, [currentPage, objectIDs]);

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

  if (currentObjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex flex-col items-center p-8 sm:p-20">
        {/* Header */}
        <header className="w-full flex justify-center py-4">
          <h1 className="text-2xl font-bold">{currentObjects[0].department}</h1>
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {currentObjects.map((obj) => (
            <div key={obj.objectID} className="bg-gray-100 p-4 shadow flex flex-col items-center">
              <h2 className="truncate w-full text-center" dangerouslySetInnerHTML={{ __html: obj.title || "Untitled" }}></h2>
              <h3>{obj.artistDisplayName}</h3>
              <div className="w-full max-w-xs aspect-square relative">
                <Image fill src={obj.primaryImageSmall} alt={obj.title} style={{ objectFit: "cover" }} sizes="100vw, (mix-width:  + 1640px) 50vw, (min-width: 1024) 33vw" />
              </div>
            </div>
          ))}
        </main>

        {/* Footer */}
        <footer className="w-full flex justify-between py-4">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
          <p className="text-sm">{currentPage}</p>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
        </footer>
      </div>
    );
  }
}