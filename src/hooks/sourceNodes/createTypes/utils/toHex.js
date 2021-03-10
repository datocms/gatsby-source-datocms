module.exports = function toHex(parent) {
  const rgba = ['red', 'green', 'blue', 'alpha'].map(component => {
    const hex = parent[component].toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  });

  return rgba[3] === 'ff'
    ? `#${rgba.slice(0, 3).join('')}`
    : `#${rgba.join('')}`;
}