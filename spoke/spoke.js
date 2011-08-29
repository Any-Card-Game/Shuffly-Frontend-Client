CodeMirror.defineMode("Spoke", function (config, parserConfig) {
    var indentUnit = config.indentUnit;
    var jsonMode = parserConfig.json;

    // Tokenizer
    var keywords = function () {
            var A = "keyworda",
                B = "keywordb",
                C = "keywordc";
            return {
                "if": A,
                "def": A,
                "class": A,
                "else": A,
                "create": A,
                "return": A,
                "yield": A,
                "macro": A,
                "true": B,
                "false": B,
                "null": B,
                "switch": B,
            };
        }();


    function nextUntilUnescaped(stream, end) {
        var escaped = false,
            next;
        while ((next = stream.next()) != null) {
            if (next == end && !escaped) return false;
            escaped = !escaped && next == "\\";
        }
        return escaped;
    }



    var isOperatorChar = /[+\-*&%,\:.=<>()!?|]/;

    function parseStream(startOfLine, stream, state) {


        var ch = stream.next();
        if (/\d/.test(ch)) {
            stream.match(/^\d*(?:\.\d*)?(?:e[+\-]?\d+)?/);
            return "number";
        } else if (isOperatorChar.test(ch) || ch == '}' || ch == '{') {


            state.wasPeroid = false;

            if (ch == '.') state.wasPeroid = true;


            if (ch == '=' && stream.peek() == '>') {
                stream.next();
                return "specoperatorb";
            }
            if (ch == '|' && stream.peek() == '(') {
                stream.next();
                return "specoperatorc";
            }


            if (state.wasDef && ch == '(') {
                state.defParams = true;
                state.wasDef = false;
            }
            if (ch == ')' && state.defParams) {
                state.defParams = false;
            }

            if (ch == '{') {
                state.inObjectVarSet = true;
                state.wasCreate = false;
            }
            if (ch == '}') {
                state.inObjectVarSet = false;
            }

            return "specoperatora";
        } else if (ch == "\"") {
            nextUntilUnescaped(stream, "\"");
            return "string";
        } else {
            stream.eatWhile(/[\w\$_]/);
            var word = stream.current().toLowerCase();
            if (word == "create") state.wasCreate = true;
            if (word == "class") state.wasClass = true;
            if (word == "def") {
                state.defLine = true;
                state.wasDef = true;
            }
            if (state.defParams) {
                return "paramdef";
            }
            if (keywords[word] == null) {
                if (state.wasCreate) {
                    state.wasCreate = false;
                    return "createclass";
                }
                if (state.wasDef) {
                    state.wasDef = false;
                    return "createdef";
                }
                if (state.wasClass) {
                    //alert("Class " +word);
                    state.wasClass = false;
                    return "createclass";
                }

                stream.eatSpace();


                if (stream.peek() == '=' && (startOfLine || state.inObjectVarSet || state.wasPeroid)) {

                    state.wasPeroid = false;
                    return "variableb";
                }


                if (stream.peek() == '.') {
                    return "variabled";
                }

                state.wasPeroid = false;
                if (stream.peek() == '(') {

                    return "variablec";
                }

                return "variable";
            }
            return keywords[word];
        }
    }




    return {
        startState: function (basecolumn) {
            return {
                wasCreate: false,
                wasClass: false,
                wasDef: false,
                inObjectVarSet: false,
                startOfLine: false,
                wasPeroid: false,
                defParams: false,
                defLine: false

            };
        },
        token: function (stream, state) {
            if (stream.sol()) {
                state.startOfLine = true;
                state.defLine = false;
            }

            if (stream.eatSpace()) return null;

            var style = parseStream(state.startOfLine, stream, state);

            if (!stream.sol()) state.startOfLine = false;

            return style;
        }
    };
});

CodeMirror.defineMIME("text/Spoke", "Spoke");