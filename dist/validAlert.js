const alertStyle = {
  position: "absolute",
  color: "red",
  padding: "0 0",
  fontSize: ".8rem",
  pointerEvents: "none",
  "z-index": 10,
};

export function validAlert(below = 0) {

  return (node, obj) => {  // text option: noWrap 
    let [text, noWrap] = (Array.isArray(obj)) ? obj : [obj, false];
    const alert = document.createElement("div");
    alert.textContent = text;

    Object.assign(alert.style, alertStyle, noWrap ? { "white-space": "nowrap" } : {});

    function position() {
      // position text 1.5em below top left corner
      const { bottom, left } = node.getBoundingClientRect();
      alert.style.top = `${bottom + below + window.scrollY}px`;
      alert.style.left = `${left}px`;
    }

    document.body.appendChild(alert);
    position();

    return {
      update(txt) { // update txt only (do not use an array!)
        if (txt !== text) {
          text = txt;
          alert.textContent = txt;
        }
      },

      destroy() {
        alert.remove();
      }
    };
  }
}
