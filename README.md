# svelte-use-validate

### <b>Features</b>
* html inputs and svelte component validation
* keystroke reactive and optional reactive updates
* validation rules and rule chaining
* lazy validation (on first use) and OK (validate all)
* tooltip like messages and invalid field markers
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
  contra: "set", // set default: "" if section has no contra
  note: "get",
  account_number: ["required", "ibanNum"], // alt rule with ibanRuleChains(iban)
  iban: "ibanType", // alt rule with ibanRuleChains(iban)
  title: ["required", { len: { operator: ">=", len: 10, msg: "length must be >= 10" } }],
};
```

### <b>Initialize validation instance</b>

```js
// not valid markers for components
const notValidMarkers = { contra: false, section: false, grossValue: false };

const { field, OK, addValidator, fieldValues, runRuleChain } = validate(
  rulesConfig,
  (id, notValid, value) => {
    // callback to update bindings or signal notValid components
    if (id in notValidMarkers) notValidMarkers[id] = notValid;
  }
);
```

### <b>Validator funtions</b>

Validator functions have two types of arguments:
* configured rule arguments like min, max, len, msg and so on
* the field context (this)
  * id: field id, default node.id (a unique id for an html element)
  * node: the html element
  * value: the field value
  * controls: array of values to (cross) control the behaviour of the validator
  * mark: field has to be marked invalid (default true)

A validator returns notValid (true or false). True breaks the rule chain.  

### <b>Svelte use action field function arguments and defaults</b>
```js
use:field={value} or use:field={obj}
// where the value / obj argument will be decomposed as show below:
let { value, id = node.id, mark = true, controls = [] } = obj;    
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
      : "set" // no contra account => contra account = ""
  );
  // this section validator is always OK, so return false
  return false;
});
```

### <b>Valid date (day, month, year) cross field validation control</b>

```html
<td>Date</td>
<td>
  <div class="flex-start">
    <div>
      <label>
        <input
          id="day"
          use:field={{ value: day, controls: [year, month] }}
          bind:value={day}
          class="field w-4 center mr-0-5"
          placeholder="dd" />
      </label>
    </div>
    <div>-</div>
    <div>
      <label>
        <input
          id="month"
          use:field={month}
          bind:value={month}
          class="field w-4 center ml-0-5 mr-0-5"
          placeholder="mm" />
      </label>
    </div>
    <div>-</div>
    <div class="ml-0-5">{year}</div>
  </div>
</td>
```