# svelte-use-validate

### <b>Features</b>
* html inputs and svelte component validation
* keystroke reactive and optional reactive updates
* validation rules and rule chaining
* lazy validation (on first use) and OK (validate all)
* tooltip like messages and invalid field border markers
* dynamic rulechains (update rules and optional rules)
* add custom validators and cross field validators
* validator controls to control validator behaviour

### <b>Installation</b>
```
npm install -D @voscausa/svelte-use-validate
```

### <b>Config example</b>

```js
// rulesConfig = { node.id: rule or [rulechain ...], ...}
const rulesConfig = {
  day: ["required", { range: { min: 1, max: 31 } }, "dayOk"],
  month: ["required", { range: { min: 1, max: 12 } }],
  grossValue: ["required", "cents"],
  section: ["required", "sectionContra"], // optional contra
  contra: "get", // get default: "" if section has no contra
  note: "get",
  account_number: ["required", "ibanNum"], // alt rule with ibanRuleChains(iban)
  iban: "ibanType", // alt rule with ibanRuleChains(iban)
  title: ["required", { len: { operator: ">=", len: 10, msg: "length must be >= 10" } }],
};
```

### <b>Initialize validation instance</b>

```js
import { validate } from "@voscausa/svelte-use-validate";

// not valid markers for components
const notValidMarkers = { contra: false, section: false, grossValue: false };

const { field, OK, addValidator, fieldValues, runRuleChain } = validate(
  { rulesConfig, lazy: true, markDefault: 3 , alertBelow: 0, setNotValid},
  (id, notValid, value) => {
    // callback to update bindings or signal notValid components
    if (id in notValidMarkers) notValidMarkers[id] = notValid;
  }
);
```
Validate instance config options:
* rulesConfig : rulesConfig object
* lazy : validate on first use (default: ```true```)
* OK() : check all rules (check all before submit)
* addValidator : add a custom validator
* markDefault : mark invalid inputs:
  * 1 : input border only
  * 2 : message below the input only
  * 3 : both border and message
  * 0 : do not mark invalid inputs
* alertBelow : position (in pics) of the alert msg below the input (default: ```0```)
* setNotValid : optional custom validator helper function to mark invalid fields    


### <b>Validator funtions</b>

Validator functions have two types of arguments:
* configured rule arguments like min, max, len, msg and so on
* the field context (this)
  * id: field id, default: ```node.name``` (a unique id for an html element)
  * node: the html element
  * value: the field value
  * controls: array of values to (cross) control the behaviour of the validator
  * mark: field has to be marked with border and or text (default: ```3```)

A validator returns notValid (true or false). True breaks the rule chain.  

### <b>Svelte use action field function arguments and defaults</b>
```js
use:field={value} or use:field={obj}
// where the value / obj argument will be decomposed as show below:
let { value, id = node.name, mark = 3, controls = [] } = obj;    
```

### <b>Dynamic rule chaines and cross field validation</b>

```js
// alt rulechain selection to validate an account_number
addValidator("ibanType", function () {
  runRuleChain.account_number(
    // here we use the iban bool as a control
    this.value
      ? ["required", "ibanNum"]
      : ["required", { len: { operator: ">=", len: 3, msg: "not IBAN; length must be > 3" } }]
  );
  // this iban validator is always OK, return false (bool always OK)
  return false;
});
```

```js
// alt rulechain selection to validate an optional contra
addValidator("sectionContra", function () {
  runRuleChain.contra(
    // hasContra control => require a contra account input
    this.controls[0]
      ? ["required", { func: { fn: validContraSection, msg: "contra section missing" } }]
      : "get" // no contra account => contra account = ""
  );
  // this section validator is always OK, so return false
  return false;
});
```

### <b>Examples</b>

An example Svelte SPA can be found here: [voscausa/use-validate-example](https://github.com/voscausa/use-validate-example)
