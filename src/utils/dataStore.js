import { parseCSVContent } from "./csvParser";
import { simpleHash } from "./simpleHash";

const KEY = "ivr_data_v2";

export function storeFiles(files) {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  if (!db.files) db.files = [];
  localStorage.setItem(KEY, JSON.stringify(db));

  const promises = Array.from(files).map(
    (file) =>
      new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => {
          const { rows, type, dateHint } = parseCSVContent(
            reader.result,
            file.name
          );
          const hash = simpleHash(reader.result + file.name + file.size);
          const entry = {
            id: hash,
            name: file.name,
            size: file.size,
            addedAt: Date.now(),
            date: dateHint,
            type: type,
            rows,
          };
          db.files = db.files.filter((f) => f.id !== hash); // replace if same hash
          db.files.push(entry);
          localStorage.setItem(KEY, JSON.stringify(db));
          res(entry);
        };
        reader.readAsText(file);
      })
  );
  return Promise.all(promises);
}

export function listFiles() {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  return db.files || [];
}

export function updateFileDate(id, isoDate) {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  const f = (db.files || []).find((x) => x.id === id);
  if (f) {
    f.date = isoDate;
    localStorage.setItem(KEY, JSON.stringify(db));
  }
}
