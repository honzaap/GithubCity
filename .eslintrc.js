module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ["standard", "prettier"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["simple-import-sort", "import"],
    rules: {
        indent: ["error", 4],
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
    },
};
