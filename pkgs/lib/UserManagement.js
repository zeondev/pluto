let lib = {};
let users;
let hashGen = new window.Hashes.SHA512(); // most likely error here without the lib

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

function checkUserConfig(config) {
  if (typeof config.username !== "string") return false;
  if (config.username.match(/^[a-z0-9]+$/i) === null) return false;
  if (config.username.length >= 16) return false;
  if (typeof config.password !== "string") return false;
  if (typeof config.name !== "object") return false;
  if (typeof config.name.first !== "string") return false;
  if (typeof config.name.last !== "string") return false;
  if (`${config.name.first} ${config.name.last}`.length >= 30) return false;

  let hashedPassword = hashGen.b64(config.password);

  let conf = {
    username: config.username,
    password: hashedPassword,
    name: {
      first: config.name.first,
      last: config.name.last,
    },
    avatar: config.avatar || null,
    fs: {},
  };

  return conf;
}

export default {
  name: "User Management",
  description:
    "This library handles user management. Please do not modify this library.",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l) {
    lib = l;

    users = JSON.parse(localStorage.getItem("users"), reviver);

    if (!users) {
      console.debug("users does not exist, making users");
      localStorage.setItem("users", JSON.stringify(new Map(), replacer));
      users = JSON.parse(localStorage.getItem("users"), reviver);
    } else {
      console.debug(users);
    }
  },
  data: {
    // exported functions here
    save() {
      localStorage.setItem("users", JSON.stringify(users, replacer));
      users = JSON.parse(localStorage.getItem("users"), reviver);
      return users;
    },
    addUser(config) {
      let conf = checkUserConfig(config);
      if (!conf) {
        throw new Error("Failed to verify config");
      } else {
        let id = Math.floor(Math.random() * 1000000);
        users.set(id, conf);
        return this.save();
      }
    },
    getAll() {
      return users;
    },
    getUser(uid) {
      return users.get(uid);
    },
    login(uid, pass) {
      let user = this.getUser(uid);
      if (user) {
        if (user.password === hashGen.b64(pass)) {
          localStorage.setItem("loggedInAs", uid);
          return { status: 200, user };
        } else {
          localStorage.setItem("loggedInAs", 0);
          return { status: 401 };
        }
      } else {
        return { status: 401 };
      }
    },
  },
};
