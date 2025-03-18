export async function fetchMetObjectOrNull(objectId: number): Promise<MetObject | null> {
    const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
    if (!res.ok) {
        console.error(`Failed to fetch object ${objectId}`);
        return null;
    }
    const data: MetObject = await res.json();
    return data;
}