export default {
  name: "Test library",
  description: "Example baseplate library",
  ver: 0.1, // Compatible with core 0.1
  type: "library",
  data: {
    // exported functions here
    helloworld: (name = "world") => {
      return "Hello, " + name + "!";
    },
  },
};
