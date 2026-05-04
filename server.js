/**
 * Root Server Redirect
 * This file redirects to the primary backend located in /BusConnect/server.js
 * to ensure consistency as per project requirements.
 */
console.log(">>> PRIMARY SERVER STARTING (ROOT)");
require("./BusConnect/server.js");
