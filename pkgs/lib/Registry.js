let Lib, Core;

// setup vfs w/o loadLibrary...
import VirtualFS from "./VirtualFS.js";
await VirtualFS.data.importFS();
const Vfs = VirtualFS.data;

/**
 * The registry store
 */
export class RegistryStore {
  /**@type string */
  storePath;
  constructor(path) {
    this.storePath = path;
  }
  async set(key, value) {
    let v = value;
    v = JSON.stringify(value);
    return await Vfs.writeFile(`${this.storePath}/${key}`, v);
  }
  async get(key) {
    try {
      let value = await Vfs.readFile(`${this.storePath}/${key}`);
      return JSON.parse(value);
    } catch (e) {
      return undefined;
    }
  }
  async delete(key) {
    return await Vfs.delete(`${this.storePath}/${key}`);
  }
}

export default {
  name: "Registry Library",
  description: "Create object stores in the file system registry.",
  ver: "v1.6.2",
  type: "library",
  async init(l, c) {
    Lib = l;
    Core = c;
  },
  data: {
    /**@returns {import("./Registry").RegistryStore} */
    async createStore(parent, name) {
      // make sure Registry/parent/name exists
      await Vfs.createFolder(`Registry/${parent}`);
      await Vfs.createFolder(`Registry/${parent}/${name}`);

      return new RegistryStore(`Registry/${parent}/${name}`);
    },
  },
};
