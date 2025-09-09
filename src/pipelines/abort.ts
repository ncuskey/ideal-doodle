import { requestAbort } from "../util/abort.js";
(async()=>{ await requestAbort(); console.log("⚠️ Abort flag set."); })();
