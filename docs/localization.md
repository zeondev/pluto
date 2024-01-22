# Localization

[Back to README.md](README.md)

You can add localized strings to your app by adding a `strings` property to your export:

```js
export default {
  // ...
  strings: {
    // Your strings
  },
  // ...
}
```

Strings that can't be found at all will display as their ID. Here's an example:

```js
// logs "very_invalid_string" to the console
console.log(Root.Lib.getString("very_invalid_string"));
// logs "OK" to the console if the language is en_US
console.log(Root.Lib.getString("ok"));
```