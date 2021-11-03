import { validIBAN } from './validIban.js';
import { alert } from './validAlert.js';

const intRex = new RegExp("[,\.]", "g");

// convert to date and back to check if the day result matches the input
const notValidDay = ({day, month, year}) => {
  const date = new Date(year, month - 1, day);
  return day !== date.getDate();
}

export function getValidators() { // validObj not used yet
  // use validating addValidator() to add dynamic validators

  const alerts = {};

  // default error marker 
  function markError(ctx, notValid) {
    Object.assign(ctx.node.style, {
      'border-color': notValid ? 'red' : 'initial',
      'outline': notValid ? '0' : 'initial'
    });
    return notValid;
  };

  // use mark = false for sub component validaton via a callback
  function setNotValid(ctx, notValid, msg = "warning ?") {
    // show a message below the field node
    if (ctx.id in alerts) alerts[ctx.id].update(notValid ? msg : "");
    else alerts[ctx.id] = alert(ctx.node, [notValid ? msg : "", true]);

    return (ctx.mark)
      ? markError(ctx, notValid) // default   
      : notValid;
    // we can test for mark = func (alt error marker);
  }

  // rule format: {validator: {arguments...} } 
  // runRuleChain will then run: validator(arguments) with ctx
  return [{

    // signed numeric string / string isNot a Number 
    cents: function ({ trimZero = true, msg = "not a valid amount" }) {
      const { value = '' } = this;
      this.value = value.replace(intRex, '');
      const notValid = isNaN(parseInt(this.value))
      if (!notValid && trimZero) this.value = `${parseInt(this.value)}`;
      return setNotValid(this, notValid, msg);
    },

    // form a date and check if the result contains a valid day
    dayOk: function ({ msg = "not a valid day" }) {
      // ctx (this): this.value, this.node, this.controls [array]
      // month control value to check if we have an existing date like feb 29 
      const { value: day, controls: [month] } = this;
      const notValid = (month && !isNaN(month))
        ? notValidDay({year: 2021, month: parseInt(month), day: parseInt(day)})
        : false
      return setNotValid(this, notValid, msg);
    },

    // run validation function
    func: function ({ fn = _ => { }, msg = "function validation failed" }) {
      const notValid = fn(this.value);
      return setNotValid(this, notValid, msg);
    },

    // string length. between: combine two len's
    len: function ({ operator = '==', len = 0, msg = "current length invalid" }) {
      const valid = {
        '>=': () => this.value.length >= len,
        '<=': () => this.value.length <= len,
        '==': () => this.value.length === len,
        '!=': () => this.value.length !== len
      }[operator]();
      return setNotValid(this, !valid, msg);
    },

    // numeric string value within range (>= min, <= max)
    range: function ({ min = 0, max = 0, trimZero = true, msg = "out of range" }) {
      const valid = !isNaN(this.value)
        && parseInt(this.value) >= min
        && parseInt(this.value) <= max;
      if (valid && trimZero) this.value = `${parseInt(this.value)}`;
      return setNotValid(this, !valid, msg);
    },

    // required string, length > 0
    required: function ({ msg = "required" }) {
      let notValid = [null, undefined].includes(this.value);
      if (!notValid) {
        this.value = ('' + this.value).trim();
        notValid = (this.value.length <= 0);
      }
      return setNotValid(this, notValid, msg);
    },

    // regex test, default test for numeric digits
    rex: function ({ pattern = '^\d+$', flags = 'iu', msg = "value failed rex test" }) {
      const regex = new RegExp(pattern, flags)
      const valid = regex.test(this.value);
      return setNotValid(this, !valid, msg);
    },

    // validator for iban number
    ibanNum: function ({ msg = "not a valid IBAN" }) {
      const valid = validIBAN(this.value);
      return setNotValid(this, !valid, msg);
    },

    // set default value of an optional form field
    set: function ({ value = "", notValid = false, msg = `${notValid ? `${value} was set invalid` : ""}` }) {
      this.value = value;
      return setNotValid(this, notValid, msg);
    }

  }, alerts];
};
