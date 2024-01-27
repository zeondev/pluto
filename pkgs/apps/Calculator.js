export default {
  name: "Calculator",
  description: "Add, subtract, multiply, and divide numbers!",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let CalcWindow;

    console.log("Hello from example package", Root.Lib);

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const Html = Root.Lib.html;

    CalcWindow = new Win({
      title: "Calculator",
      content: `
      `,
      pid: Root.PID,
      width: 240,
      height: 255,
      minWidth: 240,
      minHeight: 255,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => CalcWindow.close());

    wrapper = CalcWindow.window.querySelector(".win-content");
    wrapper = Html.from(wrapper);

    wrapper.style({ display: "flex", "flex-direction": "column" });

    let calculation = "";

    let outputWrapper = new Html("div")
      .style({ display: "flex", "flex-direction": "row" })
      .appendTo(wrapper);
    let output = new Root.Lib.html("input")
      .text("")
      .style({ width: "100%" })
      .attr({ readonly: true })
      .appendTo(outputWrapper);

    function refreshOutput() {
      output.attr({ value: calculation });
    }

    wrapper.on("keydown", (e) => {
      switch (e.key) {
        case "1":
          calculation += "1";
          refreshOutput();
          break;
        case "2":
          calculation += "2";
          refreshOutput();
          break;
        case "3":
          calculation += "3";
          refreshOutput();
          break;
        case "4":
          calculation += "4";
          refreshOutput();
          break;
        case "5":
          calculation += "5";
          refreshOutput();
          break;
        case "6":
          calculation += "6";
          refreshOutput();
          break;
        case "7":
          calculation += "7";
          refreshOutput();
          break;
        case "8":
          calculation += "8";
          refreshOutput();
          break;
        case "9":
          calculation += "9";
          refreshOutput();
          break;
        case "0":
          calculation += "0";
          refreshOutput();
          break;
        case "+":
          calculation += "+";
          refreshOutput();
          break;
        case "-":
          calculation += "-";
          refreshOutput();
          break;
        case "*":
          calculation += "*";
          refreshOutput();
          break;
        case "/":
          calculation += "/";
          refreshOutput();
          break;
        case "Enter":
          let finishedCalc = eval(calculation);
          calculation = finishedCalc;
          output.attr({ value: finishedCalc });
          break;
        case "=":
          let finishedCalc2 = eval(calculation);
          calculation = finishedCalc2;
          output.attr({ value: finishedCalc2 });
          break;
        case "Backspace":
          calculation = calculation.slice(0, -1);
          refreshOutput();
          break;
        case "Escape":
          calculation = "";
          refreshOutput();
          break;
        case "c":
          calculation = "";
          refreshOutput();
          break;
      }
    });

    let buttonsWrapper = new Html("div")
      .style({ display: "flex", "flex-direction": "row", "margin-top": "10px" })
      .appendTo(wrapper);

    let buttons = new Html("div")
      .class("calc-buttons", "one")
      .appendMany(
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("1").on("click", () => {
            calculation += "1";
            refreshOutput();
          }),
          new Html("button").text("2").on("click", () => {
            calculation += "2";
            refreshOutput();
          }),
          new Html("button").text("3").on("click", () => {
            calculation += "3";
            refreshOutput();
          })
        ),
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("4").on("click", () => {
            calculation += "4";
            refreshOutput();
          }),
          new Html("button").text("5").on("click", () => {
            calculation += "5";
            refreshOutput();
          }),
          new Html("button").text("6").on("click", () => {
            calculation += "6";
            refreshOutput();
          })
        ),
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("7").on("click", () => {
            calculation += "7";
            refreshOutput();
          }),
          new Html("button").text("8").on("click", () => {
            calculation += "8";
            refreshOutput();
          }),
          new Html("button").text("9").on("click", () => {
            calculation += "9";
            refreshOutput();
          })
        ),
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("C").on("click", () => {
            calculation = "";
            refreshOutput();
          }),
          new Html("button").text("0").on("click", () => {
            calculation += "0";
            refreshOutput();
          }),
          new Html("button").text("=").on("click", () => {
            let finishedCalc = eval(calculation);
            calculation = finishedCalc;
            output.attr({ value: finishedCalc });
          })
        )
      )
      .appendTo(buttonsWrapper);

    let actionButtons = new Html("div")
      .class("calc-buttons", "two")
      .appendMany(
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("+").on("click", () => {
            calculation += "+";
            refreshOutput();
          })
        ),
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("-").on("click", () => {
            calculation += "-";
            refreshOutput();
          })
        ),
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("*").on("click", () => {
            calculation += "*";
            refreshOutput();
          })
        ),
        new Html("div").class("calc-row").appendMany(
          new Html("button").text("/").on("click", () => {
            calculation += "/";
            refreshOutput();
          })
        )
      )
      .appendTo(buttonsWrapper);

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
