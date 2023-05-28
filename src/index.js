import "@jdboris/css-themes/vs-code";
// import "@vscode/codicons/dist/codicon.css";
import { setRoot } from "spa-routing";
import "./style.scss";

if (window.location.host == "jdboris.github.io") {
  setRoot("/portfolio/dist");
}
