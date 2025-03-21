import { fetchMetObjectOrNull } from "@/lib/fetchMetObject";
import { MetObject } from "@/types/MetObject";
import Image from "next/image";
import Link from "next/link";


interface MetObjectPageProps {
    params: Promise<{
        departmentId: string;
        objectId: string;
    }>;
}

export default async function MetObjectPage({ params }: MetObjectPageProps) {
    const { departmentId: departmentId, objectId: id } = await params;
    const object = await fetchMetObjectOrNull(Number(id)) as MetObject;

    return (
        <div className="min-h-screen flex flex-col items-center p-8 sm:p-20">
            {/* Header */}
            <header className="w-full flex justify-center py-4">
                <div className="flex flex-col items-center">
                    <Link href={`/department/${departmentId}`}>
                        <h1 className="text-2xl font-bold">{object.department}</h1>
                    </Link>
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
                    <ObjectOrigin object={object} />
                    <p className="mt-4">Technique: {object.medium}.</p>
                </div>
            </main >

            {/* Footer */}
            < footer className="w-full flex justify-center py-4" >
                <p className="text-sm">{object.creditLine}</p>
            </footer >
        </div >
    );
}

function ObjectOrigin({ object }: { object: MetObject }) {
    if (object.culture && object.period) {
        return <p>Origin: {object.culture}, {object.period}.</p>;
    } else if (object.culture) {
        return <p>Origin: {object.culture}.</p>;
    } else if (object.period) {
        return <p>Origin: {object.period}.</p>;
    } else {
        return null;
    }
}