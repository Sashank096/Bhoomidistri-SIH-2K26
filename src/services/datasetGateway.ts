export interface StoredDataset {
  id: string;
  projectId: string;
  channelId: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
  file: Blob;
}
import { recordAudit } from './auditLogGateway';

const DATABASE_NAME = 'bhoomidrishti-datasets';
const STORE_NAME = 'datasets';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Dataset storage is unavailable.'));
  });
}

export async function saveDataset(projectId: string, channelId: string, file: File): Promise<StoredDataset> {
  const dataset: StoredDataset = { id: `${projectId}:${channelId}`, projectId, channelId, fileName: file.name, fileType: file.type || 'application/octet-stream', sizeBytes: file.size, uploadedAt: new Date().toISOString(), file };
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => { const transaction = database.transaction(STORE_NAME, 'readwrite'); transaction.objectStore(STORE_NAME).put(dataset); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  database.close();
  recordAudit({ actor: 'Current Administrator', action: 'DATASET_IMPORTED', entity: 'Dataset', entityId: dataset.id, result: 'SUCCESS', details: `${file.name} stored for ${projectId} in the ${channelId} channel.` });
  return dataset;
}

export async function listDatasets(projectId: string): Promise<StoredDataset[]> {
  const database = await openDatabase();
  const datasets = await new Promise<StoredDataset[]>((resolve, reject) => { const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll(); request.onsuccess = () => resolve((request.result as StoredDataset[]).filter((dataset) => dataset.projectId === projectId).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))); request.onerror = () => reject(request.error); });
  database.close();
  return datasets;
}

export async function getDataset(projectId: string, channelId: string): Promise<StoredDataset | null> {
  const database = await openDatabase();
  const dataset = await new Promise<StoredDataset | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(`${projectId}:${channelId}`);
    request.onsuccess = () => resolve((request.result as StoredDataset | undefined) || null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return dataset;
}
