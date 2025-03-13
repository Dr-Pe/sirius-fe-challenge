import Image from "next/image";

async function fetchObject(objectId: number): Promise<MetObject> {
    const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
    console.log(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch object');
    }
    const data: MetObject = await res.json();
    return data;
}

export default async function MetObjectPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const object = await fetchObject(Number(id));

    return (
        <div className="min-h-screen flex flex-col items-center p-8 sm:p-20">
            {/* Header */}
            <header className="w-full flex justify-center py-4">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold">{object.department}</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full">
                <div className="bg-gray-100 p-4 shadow">
                    <h2 className="text-xl font-bold">{object.title}</h2>
                    <h3>{object.artistDisplayName}</h3>
                    <p className="text-sm">{object.objectDate}</p>
                    <div className="relative w-full h-[70vh]">
                        <Image fill src={object.primaryImage} alt={object.title} style={{ objectFit: "contain" }} />
                    </div>
                    {object.culture && object.period && (
                        <p className="mt-4">Origin: {object.culture}, {object.period}</p>
                    )}
                    <p className="mt-4">Technique: {object.medium}</p>
                </div>
            </main >

            {/* Footer */}
            < footer className="w-full flex justify-center py-4" >
                <p className="text-sm">{object.creditLine}</p>
            </footer >
        </div >
    );
}