var fs = require('fs');

var lang = {
  deflang: 'es',
  dicc: null,
  setLang: function(lang) {
    this.dicc = null;

    var lang_file = './lang/' + lang + '.json';
    if (!fs.existsSync(lang_file)) {
      lang_file = './lang/' + this.deflang + '.json';
      console.log(" That language does not exists! Using default ".red);
    }

    this.dicc = JSON.parse(fs.readFileSync(lang_file));
    return this;
  },
  get: function(string) {
    // Eval propone problemas de responsabilidades. Usar con responsabilidad
    return eval("this.dicc." + string);
  },
  trans: function(string, vars) {
    var trad = this.get(string);
    if (typeof vars === "string") vars = [vars];

    for (var i = 0; i < vars.length; i++)
      trad = trad.replace("%" + (i + 1), vars[i]);
    return trad;
  }
};

module.exports = lang;