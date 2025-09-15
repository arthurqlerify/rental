const store = {};

function ensureCollection(collection) {
  if (!store[collection]) store[collection] = [];
}

const memoryAdapter = {
  insert: async (collection, item) => {
    ensureCollection(collection);
    store[collection].push(item);
    return item;
  },

  findAll: async (collection) => {
    ensureCollection(collection);
    return [...store[collection]];
  },

  findById: async (collection, id) => {
    ensureCollection(collection);
    return store[collection].find((item) => item.id === id);
  },

  update: async (collection, id, updates) => {
    ensureCollection(collection);
    const index = store[collection].findIndex((item) => item.id === id);
    if (index === -1) return null;
    store[collection][index] = { ...store[collection][index], ...updates };
    return store[collection][index];
  },

  remove: async (collection, id) => {
    ensureCollection(collection);
    const index = store[collection].findIndex((item) => item.id === id);
    if (index === -1) return false;
    store[collection].splice(index, 1);
    return true;
  }
};

export default memoryAdapter;
