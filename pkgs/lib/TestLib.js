export default {
  name: "Test library",
  description: "Example baseplate library",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "library",
  data: {
    // exported functions here
    helloworld: (name = "world") => {
      return "Hello, " + name + "!";
    },
  },
};
