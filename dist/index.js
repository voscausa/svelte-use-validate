import { getValidators, validDay } from "./validators";
export { validDay };

const isObj = obj => typeof obj === "object" && !Array.isArray(obj);

// Validator for use: field={obj} and adds function OK() and values 
export function validate(config, callback = null) {

  // mark 0: no-border and no-text, 1: red-border 2: text 3: red-border and text
  const { rulesConfig, nodeKey = "name", lazy = "true", markDefault = 3, alertBelow = 0 } = config;

  const validObj = {
    runRuleChain: {}, // runRuleChain {[id]: closure} to rerun validation or update chain
    fieldValues: {},  // validated form values: {[id]: value}
  }

  const alertNodes = {};  // alert msg nodes

  const [validators, setNotValid] = getValidators(alertBelow, alertNodes);

  return {
    ...validObj,  // expose runRuleChain and 
    setNotValid,  // setNotValid if we need it to add a addValidator with: return setNotValid()

    field(node, obj) {
      // value = object (and not an array object) or value or values array
      // examples: {value: value, mark: false, controls: [control values] } or value
      // optional control values to control the validator behaviour
      let { value, id = node[nodeKey], mark = markDefault, controls = [] } =
        isObj(obj) ? obj : { value: obj };

      let ruleChain = rulesConfig[id]; // enclose ruleChain

      // inner closure to validate node value: apply rule chain (array / chain of rules)
      validObj.runRuleChain[id] = (altRuleChain = null) => {
        if (altRuleChain !== null) ruleChain = altRuleChain;

        let notValid = false;
        // run the rulechain array: {validator: { options}} or chain: [validator obj, ..] or "validator"
        for (const rule of Array.isArray(ruleChain) ? ruleChain : [ruleChain]) {
          const [validator, options] = (typeof rule === "object") ? Object.entries(rule)[0] : [rule, {}];

          // validator ctx (this context): {id, node, mark, value, [rest]}
          const ctx = { id, node, mark, value };
          // we allow an array of controls
          ctx.controls = Array.isArray(controls) ? controls : [controls];

          notValid = validators[validator].call(ctx, options);
          // break the chain if notValid was returned
          if (notValid) break;
          value = ctx.value;
        }

        // ruleChain finished, set field results
        if (value !== validObj.fieldValues[id]) {
          validObj.fieldValues[id] = value;
          // callback to pass node validation result
          if (callback) callback(id, notValid, value);
        }
        return notValid;
      };

      if (!lazy) validObj.runRuleChain[id]();

      return {
        // value update and optional controls update
        update(obj) {
          // value = object (and not an array object) or a value
          ({ value, controls =[] } = isObj(obj) ? obj : { value: obj });
          validObj.runRuleChain[id]();
        },

        destroy() {
          // we do not need to validate this message node anymore
          if (id in alertNodes) alertNodes[id].destroy();
        }
      };
    },

    // submit = OK()
    OK() {
      // re-run all the runRuleChains (closures) to make sure we have them all
      return Object.values(validObj.runRuleChain).reduce((a, c) => !c() && a, true);
    },

    // add a validator function
    addValidator(validator, func) {
      if (validators[validator] === undefined) validators[validator] = func;
    },
  };

}
