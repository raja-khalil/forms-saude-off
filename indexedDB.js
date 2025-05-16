export const salvarOffline = (dados) => {
  const request = indexedDB.open("censoDB", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("respostas")) {
      db.createObjectStore("respostas", { autoIncrement: true });
    }
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction("respostas", "readwrite");
    const store = tx.objectStore("respostas");
    store.add(dados);
  };
};
