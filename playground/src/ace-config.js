import ace from "ace-builds";
import "./styles/ace-theme.css";

ace.define("ace/theme/iceberg", (_, exports) => {
  exports.isDark = true;
  exports.cssClass = "ace-iceberg";
});

// Tell theme, syntax highlight module url to webpack. For detail, see "ace-builds/webpack-resolver"
ace.config.setModuleUrl(
  "ace/mode/ocaml",
  require("file-loader?esModule=false!ace-builds/src-noconflict/mode-ocaml.js"),
);
