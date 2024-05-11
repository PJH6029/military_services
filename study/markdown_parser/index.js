const inputEl = document.querySelector(".input");
const resultEl = document.querySelector(".result");

inputEl.addEventListener("input", (e) => {
    resultEl.innerHTML = parse(e.target.innerText);
});

function parse(mdText) {
    const lines = (new Normalizer(mdText)).get();
    const tokenizer = new Tokenizer(rulesBlock, rulesInLine);
    const tokens = tokenizer.tokenize(lines);

    const tree = new Tree();
    tokens.forEach((token, idx) => {
        tree.put(token, idx);
    });

    return tree.show();
}

class Normalizer {
    constructor(mdText) {
        this._prev = mdText;
        this._next = "";
        this._normalized = [];
        this._normalize(this._prev);
    }

    _normalize(text) {
        const carriage = /\r\n?/g;
        const tooManyNewLines = /\n+$/g;
        this._normalized = text
            .replace(carriage, "\n")
            .replace(tooManyNewLines, "\n")
            .split("\n")
            .filter(line => line !== "");
    }
    get() {
        return this._normalized;
    }
}

const MDTypes = {
    Heading: "Heading",
    Paragraph: "Paragraph",
    Hr: "Hr",
    Blockquote: "Blockquote",
    OrderedList: "OrderedList",
    UnorderedList: "UnorderedList",
    Strong: "Strong",
    Em: "Em",
    Del: "Del",
    Link: "Link",
    Img: "Img",
};

// interface
class Rule {
    name = MDTypes.Paragraph;
    rule = "";
    parse = (line) => "";
    test = (line) => this.rule.test(line);
}

class Paragraph extends Rule {
    name = MDTypes.Paragraph;
    rule = /(.*)/;
    reverseRule = /^\s*<p>(.*)<\/p>/;
    parse = (line) => line.replace(this.rule, "<p>$1</p>");
}

class Heading extends Rule  {
    name = MDTypes.Heading;
    rule = /^(#{1,6})\s(.*)/;
    parse = (line) => {
        const [heading] = line.split(/\s/);
        return line.replace(
            this.rule,
            `<h${heading.length}>$2</h${heading.length}>`,
        );
    };
}

class Hr extends Rule  {
    name = MDTypes.Hr;
    rule = /^---$/;
    parse = (line) => line.replace(this.rule, "<hr/>");
}

class Blockquote extends Rule  {
    name = MDTypes.Blockquote;
    // TODO >가 여러개면 감싸야 하는데 어카지?
    rule = /^(>+)\s(.*)/;
    reverseRule = /^\s*<p>(.*)<\/p>/;
    parse = (line) => line.replace(this.rule, "<p>$1</p>");
}

class Ol extends Rule  {
    name = MDTypes.OrderedList;
    rule = /^\s*\d+\.\s(.*)/;
    reverseRule = /^\s*<li>(.*)<\/li>/;
    parse = (line) => line.replace(this.rule, "<li>$1</li>");
}

class Ul extends Rule  {
    name = MDTypes.UnorderedList;
    rule = /^\s*[*-]\s(.*)/;
    reverseRule = /^\s*<li>(.*)<\/li>/;
    parse = (line) => line.replace(this.rule, "<li>$1</li>");
}

class Strong extends Rule  {
    name = MDTypes.Strong;
    rule = /(\*\*|__)(.+)\1/;
    parse = (line) => line.replace(this.rule, "<strong>$2</strong>");
}

class Em extends Rule  {
    name = MDTypes.Em;
    rule = /([*_])(.+)\1/;
    parse = (line) => line.replace(this.rule, "<em>$2</em>");
}

class Del extends Rule {
    name = MDTypes.Del;
    rule = /(~~)(.+)\1/;
    parse = (line) => line.replace(this.rule, "<del>$2</del>");
}

class Link extends Rule {
    name = MDTypes.Link;
    rule = /\[(.*)\]\((.*)\)/;
    parse = (line) => line.replace(this.rule, "<a href='$2'>$1</a>");
}

class Img extends Rule {
    name = MDTypes.Img;
    rule = /!\[(.*)\]\((.*)\)/;
    parse = (line) => line.replace(this.rule, "<img src='$2 alt='$1 />");
}

class RuleFactory {
    static create(type) {
        switch (type) {
            case MDTypes.UnorderedList:
                return new Ul();
            case MDTypes.Paragraph:
                return new Paragraph();
            case MDTypes.OrderedList:
                return new Ol();
            case MDTypes.Hr:
                return new Hr();
            case MDTypes.Heading:
                return new Heading();
            case MDTypes.Blockquote:
                return new Blockquote();
            case MDTypes.Em:
                return new Em();
            case MDTypes.Strong:
                return new Strong();
            case MDTypes.Del:
                return new Del();
            case MDTypes.Link:
                return new Link();
            case MDTypes.Img:
                return new Img();
            default:
                return new Paragraph();
        }
    }
}

const rulesBlock = (() => [
    RuleFactory.create(MDTypes.UnorderedList),
    RuleFactory.create(MDTypes.OrderedList),
    RuleFactory.create(MDTypes.Hr),
    RuleFactory.create(MDTypes.Heading),
    RuleFactory.create(MDTypes.Blockquote),
])();

const rulesInLine = (() => [
    RuleFactory.create(MDTypes.Strong),
    RuleFactory.create(MDTypes.Em),
    RuleFactory.create(MDTypes.Del),
    RuleFactory.create(MDTypes.Img),
    RuleFactory.create(MDTypes.Link),
])();

class Token {
    constructor(rule, val) {
        this._rule = rule;
        this._value = val;
        // this._html = this._rule.parse(this.value);
        this._html = "";
        this.children = [];
    }
    
    get rule() {
        return this._rule;
    }

    get value() {
        return this._value;
    }

    set value(newVal) {
        this._value = newVal;
    }

    get html() {
        return this._html;
    }

    set html(newVal) {
        this._html = newVal;
    }

    size() {
        return this.children.length;
    }

    putChild(childToken, idx) {
        this.children.splice(idx, 0, childToken);
    }

    getChild(idx) {
        if (this.size() === 0) {
            return this;
        }

        return this.children[idx];
    }
}

class ListTokenUtil {
    static getInnerHtml(token) {
        console.log(token.rule.reverseRule);
        return token.html.replace(token.rule.reverseRule, "$1");
    }
}

class Tokenizer {
    constructor(rulesBlock, rulesInLine) {
        this._rulesBlock = rulesBlock;
        this._rulesInLine = rulesInLine;
    }

    _lineToToken(line) {
        for (let rule of this._rulesBlock) {
            if (rule.test(line)) {
                return new Token(rule, line);
            }
        }

        return new Token(RuleFactory.create(MDTypes.Paragraph), line);
    }

    _parseBlock(token) {
        // ?? 굳이 나눠야 함? 
    }

    _parseInLine(token) {
        for (let rule of this._rulesInLine) {
            if (rule.test(token.html)) {
                const newHtml = rule.parse(token.html);
                token.html = newHtml;
            }
        }
    }

    tokenize(lines) {
        const blockquote = {
            start: "<blockquote>",
            end: "</blockquote>",
        };

        let tokens = lines.map(line => this._lineToToken(line));

        let indentCnt = 0, beforeCnt = -1;

        const levels = {
            [MDTypes.OrderedList]: 0,
            [MDTypes.UnorderedList]: 0,
            [MDTypes.Blockquote]: 0,
        }
        const listStack = [];

        let listTypes = [MDTypes.OrderedList, MDTypes.UnorderedList];

        const listTags = {
            [MDTypes.OrderedList]: {
                start: "<ol>",
                end: "</ol>",
            },
            [MDTypes.UnorderedList]: {
                start: "<ul>",
                end: "</ul>",
            },
        };

        console.log(tokens);
        tokens = tokens.map((token, idx, arr) => {
            if (listTypes.includes(token.rule.name)) {
                console.log(ListTokenUtil.getInnerHtml(token));
                // handle list
                const MDType = token.rule.name;

                const space = token.value.match(/(^\s*)/)[1];
                indentCnt = space.length;
                // console.log(token, space, token.value, indentCnt);

                if (idx === 0 || MDType !== arr[idx - 1].rule.name || indentCnt > beforeCnt) {
                    // 새로 시작
                    // console.log("start", token);
                    token.html = listTags[MDType].start + token.html;
                    listStack.push(MDType);
                }

                if (idx >= lines.length - 1 || !listTypes.includes(arr[idx + 1].rule.name) || indentCnt > arr[idx + 1].value.match(/(^\s*)/)[1].length) {
                    // 끝
                    // console.log("end", token);
                    const popType = listStack.pop();
                    token.html = token.html + listTags[popType].end;
                }

                beforeCnt = indentCnt;

            } else if (token.rule.name === MDTypes.Blockquote) {
                // handle block quote
            }

            if (idx === lines.length - 1) {
                while (listStack.length > 0) {
                    const popType = listStack.pop();
                    token.html = token.html + listTags[popType].end;
                }
            }

            return token;
        });

        let idx = 0;
        while (idx < lines.length) {
            const token = tokens[idx];
            if (listTypes.includes(token.rule.name)) {

            } else if (token.rule.name === MDTypes.Blockquote) {

            }
        }

        while (listStack.length > 0) {
            const popType = listStack.pop();
            tokens[tokens.length - 1].html = tokens[tokens.length - 1].html + listTags[popType].end;
        }

        tokens.forEach(token => this._parseInLine(token));
        return tokens;
    }
}

class Tree {
    constructor() {
        this._root = new Token(RuleFactory.create(MDTypes.Paragraph), "");
    }

    size() {
        return this._root.size();
    }

    get(idx) {
        return Tree._get(this._root, idx);
    }

    static _get(token, idx) {
        return token.getChild(idx);
    }

    static _put(token, parent, idx) {
        parent.putChild(token, idx);
    }

    put(token, idx) {
        Tree._put(token, this._root, idx);
    }

    show() {
        let result = "";

        if (this._root.children) {
            for (let i = 0; i < this._root.size(); i++) {
                const html = this._root.children[i].html;
                result = result + html;
            }
        }

        console.log(result);
        return result;
    }
}

/*
1. test
2. test2
	- test3
	- test4
		- test5
	- test6
3. test7
	1. test8
	2. test9
	- test10 (이건??)
4. test8

<li>test</li>
<li>test2</li>
<li>test3</li>
<li>test4</li>
<li>test5</li>
<li>test6</li>
<li>test7</li>
<li>test8</li>
<li>test9</li>
<li>test10</li>
<li>test8</li>


<ol>
	<li>test</li>
	<li>
		test2
		<ul>
			<li>test3</li>
			<li>
				test4
				<ul>
					<li>test5</li>
				</ul>
			</li>
			<li>test6</li>
		</ul>
	</li>

	<li>
		test7
		<ol>
			<li>test8</li>
			<li>test9</li>
		</ol>
		<ul>
			<li>test10</li>
		</ul>
	</li>
	<li>test8</li>
</ol>

<ol><li>test</li>
<li>test2
	<ul><li>test3</li>
	<li>test4
	<ul><li>test5</li></ul></li>
	<li>test6</li></ul></li>
<li>test7
	<ol><li>test8</li>
	<li>test9</li></ol>
	<ul><li>test10</li></ul></li>
<li>test8</li></ol>

새로 시작 조건:

1. index가 0
2. index가 1 이상이면: 이전꺼랑 다름
3. 이전꺼랑 같으면: 이전꺼보다 인덴트가 큼

index == 0 || mdType !== prevType || indent !== prevIndent

끝나는 조건:
1. 마지막줄 (다 닫아야 함)
2. 마지막줄이 아니면: 다음줄이 리스트가 아님
3. 다음줄이랑 리스트면: 다음줄보다 인덴트가 큼



-> level ++
*/