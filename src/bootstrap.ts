import "./main";
import "./final.css";
import { mountHistory } from "./history/ui";
import { registerPwa } from "./pwa/register";

registerPwa();
mountHistory();
