const fs = require("fs");
fs.writeFileSync(
  "./.env",
  `MAPBOX_GL_ACCESS_TOKEN=${process.env.MAPBOX_GL_ACCESS_TOKEN}\nMAPBOX_STYLE_URI=${process.env.MAPBOX_STYLE_URI}\nGEOJSON_DATA_SOURCE=${process.env.GEOJSON_DATA_SOURCE}`
);
