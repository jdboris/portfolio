export default function debounce(oldId, callback) {
  if (oldId) {
    clearTimeout(oldId);
  }

  return setTimeout(() => {
    callback();
  }, 500);
}
