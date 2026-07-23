# us-beta-inputbox

This package now includes Tailwind CSS support. Run `npm install` and then `npm run build:css` to generate `dist/styles.css` from `src/styles.css`.

Import the generated stylesheet in your app to enable Tailwind classes on the input component:

```js
import "us-beta-inputbox/styles.css";
```

feat(InputBox): reusable input with icons, custom height, focus/error states, password toggle, clear button, and dynamic decimal-aware numeric handling via allowDecimal(value, places) and returnAsNumber for typed number output.
