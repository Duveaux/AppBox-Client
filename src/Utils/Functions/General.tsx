export const remove = (array, id) => {
  return array.some((o, i, a) =>
    o.id === id ? a.splice(i, 1) : remove(o.items || [], id)
  );
};

export const updateById = (array, newItem) => {
  (array || []).forEach(update(newItem.id, newItem));
};

let update = (id, newItem) => (obj) => {
  if (obj.id === id) {
    obj = newItem;
    return true;
  } else if (obj.items) return obj.items.some(update(id, newItem));
};

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export const rgbToHex = (r, g, b) =>
  `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

export const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};
