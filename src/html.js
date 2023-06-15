export default function html(string) {
  const template = document.createElement("template");
  template.innerHTML = string.trim();
  return template.content.firstChild;
}
