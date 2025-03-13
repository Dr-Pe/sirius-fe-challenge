"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FetchObjectsResponse {
  objectIDs: number[];
  total: number;
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

async function fetchObject(objectId: number): Promise<MetObject> {
  const res = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch object');
  }
  const data: MetObject = await res.json();
  return data;
}

export default function DepartmentPage() {
  const params = useParams();
  const id = params.id as string;
  const [objectIDs, setObjectIDs] = useState<number[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [currentObjects, setCurrentObjects] = useState<MetObject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isGridView, setIsGridView] = useState(true);

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
      let objectsData: MetObject[] = [];
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

      setCurrentObjects(objectsData.slice(0, itemsPerPage)); // Store objects in context
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
        <main className="flex-grow w-full">
          <div className="w-full flex justify-between items-center mb-4">
            <input type="text" placeholder="Search..." className="p-2 border border-gray-300"
            // onChange={(e) => {
            //   const searchTerm = e.target.value.toLowerCase();
            //   const filteredObjects = objectIDs.filter(async (id) => {
            //     const obj = await fetchObject(id);
            //     return obj.title.toLowerCase().includes(searchTerm) || obj.artistDisplayName.toLowerCase().includes(searchTerm);
            //   });
            //   setCurrentObjects(filteredObjects);
            // }}
            />
            <ListGridButton isGridView={isGridView} setIsGridView={setIsGridView} />
          </div>
          <MetObjects objects={currentObjects} isGridView={isGridView} />
        </main>

        {/* Footer */}
        <footer className="w-full flex justify-between py-4">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 disabled:opacity-50">Previous</button>
          <p className="text-sm">{currentPage}</p>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 disabled:opacity-50">Next</button>
        </footer>
      </div>
    );
  }
}

function ListGridButton({ isGridView, setIsGridView }: { isGridView: boolean, setIsGridView: (isGridView: boolean) => void }) {
  return (
    <button onClick={() => setIsGridView(!isGridView)} className="px-4 py-2">
      {isGridView ? "Switch to List View" : "Switch to Grid View"}
    </button>
  );
}

function MetObjects({ objects, isGridView }: { objects: MetObject[], isGridView: boolean }) {
  return isGridView ? <GridView objects={objects} /> : <ListView objects={objects} />
}

function ListView({ objects }: { objects: MetObject[] }) {
  return (
    <div className="flex flex-col space-y-4">
      {objects.map((obj) => (
        <Link href={`/object/${obj.objectID}`}>
          <div key={obj.objectID} className="bg-gray-100 p-4 shadow flex cursor-pointer" onClick={() => window.location.href = `/object/${obj.objectID}`}>
            <h2 className="truncate w-full" dangerouslySetInnerHTML={{ __html: obj.title || "Untitled" }}></h2>
            <h2>{obj.artistDisplayName}</h2>
            <h2>{obj.objectDate}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}

function GridView({ objects }: { objects: MetObject[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {objects.map((obj) => (
        <div key={obj.objectID} className="bg-gray-100 p-4 shadow flex flex-col items-center cursor-pointer" onClick={() => window.location.href = `/object/${obj.objectID}`}>
          <h2 className="truncate w-full text-center" dangerouslySetInnerHTML={{ __html: obj.title || "Untitled" }}></h2>
          <h3>{obj.artistDisplayName}</h3>
          <div className="w-full max-w-xs aspect-square relative">
            <Link href={`/object/${obj.objectID}`}>
              <Image fill src={obj.primaryImageSmall} alt={obj.title} style={{ objectFit: "cover" }} sizes="100vw, (mix-width:  + 1640px) 50vw, (min-width: 1024) 33vw" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}