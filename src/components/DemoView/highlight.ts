export type TokenType =
  | "keyword"
  | "builtin"
  | "string"
  | "comment"
  | "number"
  | "decorator"
  | "type"
  | "plain";

export interface Token {
  type: TokenType;
  text: string;
}

const PY_KEYWORDS = new Set([
  "import","from","def","class","return","if","else","elif","for","while",
  "with","as","async","await","yield","lambda","pass","raise","try","except",
  "finally","not","and","or","in","is","True","False","None","del","global",
  "nonlocal","assert","break","continue","match","case",
]);
const PY_BUILTINS = new Set([
  "print","len","range","type","str","int","float","bool","list","dict",
  "tuple","set","enumerate","zip","map","filter","sorted","reversed","sum",
  "min","max","abs","round","open","input","super","isinstance","hasattr",
  "getattr","setattr","repr","format","id","hex","bin","oct","callable",
]);
const TS_KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while",
  "import","export","from","class","new","this","async","await","typeof",
  "instanceof","extends","implements","type","interface","enum","namespace",
  "abstract","override","declare","as","satisfies","in","of","delete","void",
  "try","catch","finally","throw","switch","case","break","continue","default",
  "yield","static","readonly","public","private","protected","get","set",
]);
const TS_TYPES = new Set([
  "string","number","boolean","object","any","unknown","never","null",
  "undefined","Symbol","BigInt","Promise","Array","Record","Partial",
  "Required","Readonly","Pick","Omit","Exclude","Extract","NonNullable",
]);

function tokenizeLine(line: string, lang: "python" | "typescript" | "bash"): Token[] {
  if (lang === "bash") {
    if (line.trim().startsWith("#")) return [{ type: "comment", text: line }];
    if (line.trim().startsWith("$")) {
      const idx = line.indexOf(" ");
      return idx === -1
        ? [{ type: "keyword", text: line }]
        : [{ type: "keyword", text: line.slice(0, idx + 1) }, { type: "plain", text: line.slice(idx + 1) }];
    }
    return [{ type: "plain", text: line }];
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comment
    if (lang === "python" && line[i] === "#") {
      tokens.push({ type: "comment", text: line.slice(i) });
      break;
    }
    if (lang === "typescript" && line.slice(i, i + 2) === "//") {
      tokens.push({ type: "comment", text: line.slice(i) });
      break;
    }

    // Decorator
    if (line[i] === "@") {
      const end = line.slice(i + 1).search(/[^a-zA-Z0-9_.]/);
      const word = end === -1 ? line.slice(i) : line.slice(i, i + 1 + end);
      tokens.push({ type: "decorator", text: word });
      i += word.length;
      continue;
    }

    // String: triple first, then single
    if (lang === "python" && line.slice(i, i + 3).match(/^("""|\'\'\')(.*)/)) {
      const delim = line.slice(i, i + 3);
      const end = line.indexOf(delim, i + 3);
      if (end !== -1) {
        tokens.push({ type: "string", text: line.slice(i, end + 3) });
        i = end + 3;
      } else {
        tokens.push({ type: "string", text: line.slice(i) });
        i = line.length;
      }
      continue;
    }
    const fPrefix = lang === "python" && line[i] === "f" && (line[i + 1] === '"' || line[i + 1] === "'");
    if (line[i] === '"' || line[i] === "'" || line[i] === "`" || fPrefix) {
      const start = i;
      const q = fPrefix ? line[i + 1] : line[i];
      i += fPrefix ? 2 : 1;
      while (i < line.length && line[i] !== q) {
        if (line[i] === "\\") i++;
        i++;
      }
      i++; // closing quote
      tokens.push({ type: "string", text: line.slice(start, i) });
      continue;
    }

    // Number
    if (/[0-9]/.test(line[i]) && (i === 0 || !/[a-zA-Z_]/.test(line[i - 1]))) {
      const end = line.slice(i).search(/[^0-9._xXbBoO]/);
      const num = end === -1 ? line.slice(i) : line.slice(i, i + end);
      tokens.push({ type: "number", text: num });
      i += num.length;
      continue;
    }

    // Word (keyword / builtin / type / plain)
    if (/[a-zA-Z_]/.test(line[i])) {
      const end = line.slice(i).search(/[^a-zA-Z0-9_]/);
      const word = end === -1 ? line.slice(i) : line.slice(i, i + end);
      if (lang === "python") {
        if (PY_KEYWORDS.has(word)) tokens.push({ type: "keyword", text: word });
        else if (PY_BUILTINS.has(word)) tokens.push({ type: "builtin", text: word });
        else tokens.push({ type: "plain", text: word });
      } else {
        if (TS_KEYWORDS.has(word)) tokens.push({ type: "keyword", text: word });
        else if (TS_TYPES.has(word)) tokens.push({ type: "type", text: word });
        else tokens.push({ type: "plain", text: word });
      }
      i += word.length;
      continue;
    }

    // Everything else: plain
    const end = line.slice(i).search(/[a-zA-Z0-9_"'`@#]/);
    const chunk = end === -1 ? line.slice(i) : line.slice(i, i + end);
    if (chunk.length > 0) {
      tokens.push({ type: "plain", text: chunk });
      i += chunk.length;
    } else {
      tokens.push({ type: "plain", text: line[i] });
      i++;
    }
  }
  return tokens;
}

export function tokenize(code: string, lang: "python" | "typescript" | "bash"): Token[][] {
  return code.split("\n").map((line) => tokenizeLine(line, lang));
}
