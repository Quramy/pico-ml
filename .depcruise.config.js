module.exports = {
  options: {
    exclude: {
      path: "package",
    },
    reporterOptions: {
      dot: {
        theme: {
          graph: { rankdir: "LR" },
        },
      },
    },
  },
};
