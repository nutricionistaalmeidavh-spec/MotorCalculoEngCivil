export interface HistoryEntry {
  id: string;
  createdAt: number;
  expression: string;
  operation: string;
  variable: string;
  resultText: string;
  target?: string;
  direction?: string;
  derivativeOrder?: number;
  tangentPoint?: string;
  lower?: string;
  upper?: string;
}

const DB_NAME = "motor-calculo-eng-civil";
const DB_VERSION = 1;
const STORE_NAME = "history";
const MAX_HISTORY = 60;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir o histórico local."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Falha ao atualizar o histórico."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Atualização do histórico cancelada."));
  });
}

function createId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildHistoryEntry(input: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  return {
    ...input,
    id: createId(),
    createdAt: Date.now(),
  };
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(entry);
    await transactionDone(transaction);
  } finally {
    db.close();
  }

  await pruneHistory();
}

export async function listHistory(limit = MAX_HISTORY): Promise<HistoryEntry[]> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const index = transaction.objectStore(STORE_NAME).index("createdAt");
      const results: HistoryEntry[] = [];
      const request = index.openCursor(null, "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || results.length >= limit) {
          resolve(results);
          return;
        }
        results.push(cursor.value as HistoryEntry);
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? new Error("Falha ao ler o histórico."));
    });
  } finally {
    db.close();
  }
}

export async function clearHistory(): Promise<void> {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).clear();
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}

async function pruneHistory(): Promise<void> {
  const entries = await listHistory(MAX_HISTORY + 20);
  if (entries.length <= MAX_HISTORY) return;

  const toDelete = entries.slice(MAX_HISTORY);
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const entry of toDelete) store.delete(entry.id);
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}
