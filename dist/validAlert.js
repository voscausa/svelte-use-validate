const alertStyle = {
  position: 'absolute',
  color: 'red',
  padding: '.4em .1em',
  fontSize: '.8rem',
  pointerEvents: 'none',
  'z-index': 10,
};

export function alert(node, obj) {  // text option: noWrap 
  let [text, noWrap] = (Array.isArray(obj)) ? obj : [obj, false];
  const alert = document.createElement('div');
  alert.textContent = text;

  Object.assign(alert.style, alertStyle, noWrap ? { 'white-space': 'nowrap' } : {});

  function position() {
    // position text 1.5em below top left corner
    const { top, left } = node.getBoundingClientRect();
    alert.style.top = `${top + 24 + window.scrollY}px`;
    alert.style.left = `${left}px`;
  };

  document.body.appendChild(alert);
  position();

  return {
    update(txt) { // update txt only (do not use an array!)
      if (txt !== text) {
        text = txt;
        alert.textContent = txt;
      };
    },

    destroy() {
      alert.remove();
    }
  };
};
