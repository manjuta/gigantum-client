module.exports = {
 "presets": [
   "@babel/preset-react",
   "@babel/preset-env",
   "react-app"
 ],
 "plugins": [
   "relay",
   "@babel/plugin-proposal-class-properties",
   "@babel/plugin-syntax-dynamic-import",
   ["@babel/plugin-proposal-decorators", {
    "legacy": true
   }],
   ["@babel/plugin-proposal-object-rest-spread", { "loose": true, "useBuiltIns": true }],
   [
     "module-resolver",
     {
       "root": [
         "./src",
         "./submodules"
       ],
       "alias": {
         "Mutations": "./src/js/mutations",
         "JS": "./src/js",
         "Components": "./src/js/components",
         "Submodules": "./submodules"
       }
     }
   ]
 ]
}
