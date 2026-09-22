import "./study/app";
import "./final.css";
import "./ux.css";
import { mountHistory } from "./history/ui";
import { registerPwa } from "./pwa/register";

registerPwa();
mountHistory();
