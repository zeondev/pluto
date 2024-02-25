const verbs = [
  {
    verb: "hi",
    action: "greeting",
  },
  {
    verb: "hey",
    action: "greeting",
  },
  {
    verb: "hello",
    action: "greeting",
  },
  {
    verb: "sup",
    action: "greeting",
  },
  {
    verb: "yo",
    action: "greeting",
  },

  {
    verb: "what version",
    action: "version",
  },
  {
    verb: "what version of pluto",
    action: "version",
  },
  {
    verb: "which version",
    action: "version",
  },
  {
    verb: "which version of pluto",
    action: "version",
  },

  {
    verb: "logout",
    action: "exitSession",
  },
  {
    verb: "log out",
    action: "exitSession",
  },
  {
    verb: "end session",
    action: "exitSession",
  },
  {
    verb: "exit session",
    action: "exitSession",
  },
  {
    verb: "can you logout",
    action: "exitSession",
  },
  {
    verb: "can you log out",
    action: "exitSession",
  },
  {
    verb: "can you end session",
    action: "exitSession",
  },
  {
    verb: "can you exit session",
    action: "exitSession",
  },
  {
    verb: "could you logout",
    action: "exitSession",
  },
  {
    verb: "could you log out",
    action: "exitSession",
  },
  {
    verb: "could you end session",
    action: "exitSession",
  },
  {
    verb: "could you exit session",
    action: "exitSession",
  },

  {
    verb: "what can you do",
    action: "howWorks",
  },
  {
    verb: "what do you do",
    action: "howWorks",
  },
  {
    verb: "how do you work",
    action: "howWorks",
  },

  {
    verb: "hru",
    action: "howAmI",
  },
  {
    verb: "how are you",
    action: "howAmI",
  },

  {
    verb: "launch",
    action: "startPkg",
  },
  {
    verb: "start",
    action: "startPkg",
  },
  {
    verb: "run",
    action: "startPkg",
  },
  {
    verb: "open",
    action: "startPkg",
  },
  {
    verb: "can you launch",
    action: "startPkg",
  },
  {
    verb: "can you start",
    action: "startPkg",
  },
  {
    verb: "can you run",
    action: "startPkg",
  },
  {
    verb: "can you open",
    action: "startPkg",
  },
  {
    verb: "will you launch",
    action: "startPkg",
  },
  {
    verb: "will you start",
    action: "startPkg",
  },
  {
    verb: "will you run",
    action: "startPkg",
  },
  {
    verb: "will you open",
    action: "startPkg",
  },

  {
    verb: "thanks",
    action: "thanks",
  },
  {
    verb: "thank you",
    action: "thanks",
  },
  {
    verb: "thx",
    action: "thanks",
  },
  {
    verb: "cheers",
    action: "thanks",
  },
];

const Fuse = (await import("../../assets/fuse.mjs")).default;

async function parseString(str, apps) {
  const string = str.toLowerCase().split(" ");

  if (window.__DEBUG === true) console.log("Ask:", str, string);

  const kwSearch = new Fuse(verbs, {
    keys: ["verb"],
  });
  const appSearch = new Fuse(apps, {
    keys: ["name"],
  });

  let currAction, currApp;

  if (string.length === 1) {
    const verb = kwSearch.search(string[0]);
    const app = appSearch.search(string[0]);

    if (window.__DEBUG) console.log("ASK DEBUG", verb, app);

    if (verb.length > 0) {
      currAction = verb[0].item;
    } else if (app.length > 0) {
      currApp = app[0].item;
    }
  } else {
    // check the whole string for a command first
    const verb = kwSearch.search(str);
    if (verb.length > 0 && currAction === undefined) {
      currAction = verb[0].item;
    }

    let ignoreList = ["viewer"];

    string.forEach((word) => {
      const verb = kwSearch.search(word);
      const app = appSearch.search(word);

      if (word in ignoreList) return;

      if (window.__DEBUG) console.log("ASK DEBUG", verb, app);

      if (verb.length > 0 && currAction === undefined) {
        currAction = verb[0].item;
      } else if (app.length > 0) {
        currApp = app[0].item;
      }
    });
  }

  return { action: currAction, app: currApp };
}

async function getApps() {
  const vfs = await lib.loadLibrary("VirtualFS");

  const desktopApps = (await vfs.list("Root/Desktop"))
    .filter((f) => f.item.endsWith(".shrt"))
    .map((f) => {
      return { type: "desktop", item: f.item };
    });
  const localApps = (await vfs.list("Root/Pluto/apps"))
    .filter((f) => f.item.endsWith(".app"))
    .map((f) => {
      return { type: "local", item: f.item };
    });
  let asApps = [];
  const asExists = await vfs.whatIs("Registry/AppStore/_AppStoreIndex.json");
  if (asExists !== null) {
    asApps = (await vfs.list("Registry/AppStore"))
      .filter((f) => f.item.endsWith(".app"))
      .map((f) => {
        return { type: "appStore", item: f.item };
      });
  }

  const apps = [...localApps, ...asApps, ...desktopApps];

  const FileMappings = await lib.loadLibrary("FileMappings");

  const appsHtml = await Promise.all(
    apps.map(async (app) => {
      let icon = "box",
        name = app.item,
        description = null,
        mapping = null;

      if (app.type === "desktop") {
        const data = await FileMappings.retrieveAllMIMEdata(
          "Root/Desktop/" + app.item
        );

        mapping = data;

        icon = data.icon;
        name = data.localizedName ?? data.name;
        description = data.fullName;
      } else if (app.type === "appStore") {
        const data = await FileMappings.retrieveAllMIMEdata(
          "Registry/AppStore/" + app.item
        );

        mapping = data;

        if (data.invalid === true) {
          return undefined;
        }

        icon = data.icon;
        name = data.name;
        description = data.fullName;
      }

      const source = app.type;
      icon = icon in lib.icons ? lib.icons[icon] : icon;

      return { icon, name, description, mapping, source };
    })
  );

  return appsHtml;
}

const greetings = [
  "Hey there!",
  "Hello, {U}!",
  "Hi, {U}!",
  "What's up?",
  "Howdy, {U}!",
  "Hey, {U}!",
  "How's it going, {U}?",
  "Hiya!",
  "Greetings, {U}!",
  "Morning!",
  "Good morning!",
  "Good afternoon!",
  "Good evening!",
  "Good day, {U}!",
  "Good night, {U}!",
  "Good day to you, {U}!",
  "Good day to you too!",
];
// bot responses to "you're welcome"
const thankYous = ["Thank you!", "Thanks, {U}!"];
// bot responses to "Thank you"
const yourWelcomes = ["You're welcome!", "No problem!", "Thank you too!"];
// bot responds to "how are you"
const howAmIs = [
  "I'm doing great, {U}!",
  "I'm doing good, {U}!",
  "I'm doing fine, {U}!",
  "I'm doing okay, {U}!",
  "I'm doing well, {U}!",
  "I'm doing awesome, {U}!",
  "I'm doing amazing, {U}!",
  "I'm doing fantastic, {U}!",
  "I'm doing wonderful, {U}!",
  "I'm doing splendid, {U}!",
  "I'm doing superb, {U}!",
  "I'm doing excellent, {U}!",
  "I'm doing marvelous, {U}!",
  "I'm doing fabulous, {U}!",
  "I'm doing incredible, {U}!",
  "I'm doing outstanding, {U}!",
  "I'm doing phenomenal, {U}!",
  "I'm doing terrific, {U}!",
];
// bot responses to "how do you work" / "what can you do"
const howDoIWorks = [
  "I can help you launch apps, answer questions, and more!",
  "I can help you with launching apps, answering questions, and more!",
  "I can open apps, answer questions, and more!",
];

const youAreRunning = [
  "You are running {plutoVersion} ({codeName}).",
  "You're on version {plutoVersion}!",
  "You are using Pluto version {plutoVersion}, codenamed {codeName}.",
];

function replace(str, u) {
  return str.replace("{U}", u);
}

async function ask(what) {
  // get all apps
  what = what
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9 .,!?]/g, "");
  const apps = await getApps();
  const data = await parseString(what, apps);

  console.log("Here data", data);

  const userAccountService = core.services
    .filter((x) => x !== null)
    .find((x) => x.name === "Account");

  const userData = userAccountService.ref.getUserData();

  const u = userData.username;

  if (data.action === undefined) {
    return {
      type: "response",
      text: replace("I don't understand what you said, {U}.", u),
    };
  }

  function genYouAreRunning() {
    let s = youAreRunning[Math.floor(Math.random() * youAreRunning.length)];

    if (s.includes("{plutoVersion}")) {
      s = s.replace("{plutoVersion}", core.version);
    }
    if (s.includes("{codeName}")) {
      s = s.replace("{codeName}", core.codename);
    }

    return s;
  }

  switch (data.action.action) {
    case "greeting":
      return {
        type: "response",
        text: replace(
          greetings[Math.floor(Math.random() * greetings.length)],
          u
        ),
      };
    case "exitSession":
      const p = core.processList.find((s) => s.name === "ui:Desktop");
      if (p !== undefined && p !== null) p.proc.send({ type: "logout" });
      break;
    case "version":
      return { type: "response", text: genYouAreRunning() };
    case "thanks":
      return {
        type: "response",
        text: replace(
          yourWelcomes[Math.floor(Math.random() * yourWelcomes.length)],
          u
        ),
      };
    case "startPkg":
      if (data.app === undefined)
        return { type: "response", text: "I don't know what app to launch." };
      if (data.app.mapping === null)
        return {
          type: "response",
          text: `I am unable to start ${data.app.name}.`,
        };
      await data.app.mapping.onClick(core);

      return {
        type: "response",
        text: `Launching ${data.app.name}.`,
      };
    case "howWorks":
      return {
        type: "response",
        text: replace(
          howDoIWorks[Math.floor(Math.random() * howDoIWorks.length)],
          u
        ),
      };
    case "howAmI":
      return {
        type: "response",
        text: replace(howAmIs[Math.floor(Math.random() * howAmIs.length)], u),
      };
    case undefined:
    default:
      return { type: "response", text: "I don't know, sorry!" };
  }
}

let lib, core;

export default {
  name: "Assistant Library",
  description: "Handles assistant asking questions and stuff",
  ver: 1, // Compatible with core v1
  type: "library",
  init(l, c) {
    lib = l;
    core = c;
  },
  data: {
    ask,
    getApps,
  },
};
