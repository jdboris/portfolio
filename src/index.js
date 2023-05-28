import "@jdboris/css-themes/vs-code";
import { setRoot } from "spa-routing";
import "./style.scss";

setRoot(process.env.APP_PATH || "/");
