import html from "/html.js";

export function search(query) {
  if (query.length < 3) return [];

  const nodes = textNodesUnder(document.body);
  const matches = [];

  nodes.forEach((node) =>
    matches.push(
      ...[
        ...node.textContent.matchAll(
          new RegExp(query.replace("\\", "\\\\"), "ig")
        ),
      ].map((x) => ({ ...x, node }))
    )
  );

  return matches;
}

export function revealMatch(match) {
  const route = match.node.parentElement.closest("spa-route");
  if (route && location.pathname != route.path) {
    history.pushState(null, null, route.path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  markToken(match.node, match[0], match.index);
}

// Source: https://stackoverflow.com/a/4183448
export function selectMatch(match) {
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(match.node);
  range.setStart(match.node, match.index);
  range.setEnd(match.node, match.index + match[0].length);

  sel.removeAllRanges();
  sel.addRange(range);
}

function markToken(node, token, index) {
  node.replaceWith(
    node.textContent.substring(0, index),
    html(`<mark>${token}</mark>`),
    node.textContent.substring(index + token.length)
  );
}

function textNodesUnder(el) {
  let n,
    a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while ((n = walk.nextNode())) a.push(n);
  return a;
}
