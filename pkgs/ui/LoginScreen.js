let hashGen = new window.Hashes.SHA512();

export default {
  name: "Login Screen",
  description: "Login screen for Pluto",
  privileges: 1,

  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined

    console.log("Hello from example package", Root);

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        wrapper.cleanup();
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    wrapper = new Root.Lib.html("div").appendTo("body");

    const Um = await Root.Lib.loadLibrary("UserManagement");
    console.log("Um,", Um);

    const users = Um.getAll();
    console.log(users.size, "size of user");
    if (users.size <= 0) {
      new Root.Lib.html("div")
        .appendTo(wrapper)
        .html("<b>IT LOOKS LIKE YOU HAVE NO USERS WHAT DID YOU DO</b>");
    } else {
      new Root.Lib.html("div")
        .appendTo(wrapper)
        .html("<b>IT LOOKS LIKE YOU HAVE USERS HOORAY</b>");
      let i = 0;
      users.forEach((user) => {
        let usr = [...Um.getAll()][i];
        console.log(usr);
        // let userElm = new Root.Lib.html("p").appendTo(wrapper).html(`
        // <b>ID:</b> ${[...Um.getAll()][i][0]}<br>
        // <b>Username:</b> ${user.username}<br>
        // <b>FullName:</b> ${user.name.first} ${user.name.last}<br>
        // `)

        // let passwordInput = new Root.Lib.html("input").attr({ type: "password", placeholder: "Password..." }).appendTo(userElm)
        // let passwordButton = new Root.Lib.html("button").html("login").appendTo(userElm)

        // passwordButton.elm.addEventListener("click", () => {
        //   console.log(i, usr)
        //   let login = Um.login(usr[0], passwordInput.elm.value)
        //   if (login.status == 200) {
        //     console.log("password match, launching new app")

        //     console.log(Root.Core.startPkg("ui:Desktop"))
        //     onEnd()
        //   } else {
        //     console.log("password not match")
        //   }
        // })
        i++;
      });
    }

    console.log(users);

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example received message: " + m);
    });
  },
};
