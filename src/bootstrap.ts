import "./study/app";
import "./final.css";
import "./ux.css";
import "./studyHub/studyHub.css";
import { mountHistory } from "./history/ui";
import { registerPwa } from "./pwa/register";
import { mountStudyHub } from "./studyHub/bootstrap";

const pwaStatus = registerPwa();
mountHistory();
void mountStudyHub({ pwaStatus });
