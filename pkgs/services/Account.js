export default {
  name: "Account",
  description: "Account data information",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
     async function login(u, p) {
      return await fetch("https://zeon.dev/api/public/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers needed for authentication or other purposes
        },
        body: JSON.stringify({
          // Add your request data in the appropriate format
          username: u,
          password: p,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status !== 200) return data;

          if (!sessionStorage.getItem("userData")) {
            sessionStorage.setItem("userData", JSON.stringify(data.info));
            checkUserData();
            return data;
          } else {
            return data;
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("the error occurred", error);
        });
    }

    function logout() {
      sessionStorage.removeItem("userData");
      checkUserData();
    }

    const stockUserData = {
      username: "User",
      pfp: "./assets/user-avatar.svg",
      id: -1,
      email: null,
      onlineAccount: false,
    };

    let currentUserData = {
      username: "User",
      pfp: "./assets/user-avatar.svg",
      id: -1,
      email: null,
      onlineAccount: sessionStorage.getItem("userData") !== null,
    };

    function checkUserData() {
      if (sessionStorage.getItem("userData") !== null) {
        try {
          const data = JSON.parse(sessionStorage.getItem("userData"));
          if (data.user && data.pfp && data.id && data.email) {
            currentUserData.username = data.user;
            currentUserData.pfp = data.pfp.replace("/", "https://zeon.dev/");
            currentUserData.id = data.id;
            currentUserData.email = data.email;
            currentUserData.onlineAccount = true;
          }
        } catch (e) {}
      } else {
        Object.assign(currentUserData, stockUserData);
      }
    }

    checkUserData();

    return {
      login,
      logout,
      getUserData() {
        checkUserData();
        return currentUserData;
      },
    };
  },
};
