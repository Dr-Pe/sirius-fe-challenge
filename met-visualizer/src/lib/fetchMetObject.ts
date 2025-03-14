export async function fetchMetObject(objectId: number): Promise<MetObject> {
    const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
    if (!res.ok) {
        throw new Error('Failed to fetch object');
    }
    const data: MetObject = await res.json();
    return data;
}