module.exports = {
  "syn_frontend_react/**/*.{js,jsx,ts,tsx}": (files) => {
    const rel = files.map((f) => f.replace(/^syn_frontend_react\\//, ""));
    if (rel.length === 0) return [];
    return [`bash -lc "cd syn_frontend_react && npx eslint --fix ${rel.map((f) => `'${f.replace(/'/g, \"'\\\\''\")}'`).join(' ')}"`];
  },
};

