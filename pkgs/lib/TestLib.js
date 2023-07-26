export default {
  name: "Test library",
  description: "Example baseplate library",
  ver: 1, // Compatible with core v1
  type: "library",
  data: {
    // exported functions here
    helloworld: (name = "world") => {
      return "Hello, " + name + "!";
    },
  },
};
