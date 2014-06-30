fs = require "fs"
#fake react dependency
React =
  DOM:
    div: (->)
component = <div></div>

exports.readFileSync = () -> fs.readFileSync()
exports.component = component
