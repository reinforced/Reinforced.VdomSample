module Reinforced.Lattice.Html {

    /**
     * State-machine based HTML parser
     */
    export class HtmlParser<T> implements Reinforced.Lattice.Html.IParseContext {

        /**
         * Constructs new HTML parser
         * 
         * @param constructor Nodes constructor
         */
        constructor(constructor: IHtmlConstructor<T>) {
            this._constructor = constructor;
        }

        /**
         * Parses input HTML to set of HTML nodes of constructor's type.
         * Puts 
         * 
         * @param html
         */
        public parse(html: string): IParseResult<T> {
            this._html = html;
            this.traverse();
            return this._result;
        }

        //#region Internals
        /** @internal */
        public Tags: Stack<string> = new Stack<string>();

        /** @internal */
        public CdataQuotes: Stack<string> = new Stack<string>();
        
        /** @internal */
        public afterSkip: State;

        /** @internal */
        public quote: string;

        /** @internal */
        public attrName: string;

        /** @internal */
        public attrVal: string;
        //#endregion

        private _constructor: IHtmlConstructor<T>;
        private _html: string;
        private _currentSpecial: ISpecialTag;
        private _stack: Stack<T> = new Stack<T>();
        private _result: IParseResult<T> = {
            Roots: [],
            SpecialTags: []
        };

        private _state: State;

        private traverse() {
            var flag = true;
            this._state = State.Content;
            this.fix();
            do {
                if (!this.setState(Reinforced.Lattice.Html._parseMachine[this._state].do(this)))
                    if (!(flag = this.next())) break;
            } while (flag);
        }

        private setState(state: State): boolean {
            if (state == null || state == undefined) return false;
            if (state !== this._state) {
                if (_parseMachine[this._state].exit != null)
                    _parseMachine[this._state].exit(this, state);
                if (_parseMachine[state].enter != null)
                    _parseMachine[state].enter(this, this._state);
                this._state = state;
                return true;
            }
            return false;
        }

        //#region Signals
        public signalContent(content: string) {
            if (content == null || content.length === 0) return;
            if (this._currentSpecial != null) {
                this._currentSpecial.Content = content;
            } else {
                var t = this._constructor.content(this._stack.Current, content);
                if (this._stack.Current == null) this._result.Roots.push(t);
            }
        }
        public signalComment(content: string) {
            if (content == null || content.length === 0) return;
            var t = this._constructor.comment(this._stack.Current, content);
            if (this._stack.Current == null) this._result.Roots.push(t);
        }
        public signalCloseTag(tag: string): number {
            if (this._currentSpecial != null) {
                this._currentSpecial = null;
            } else {
                this._stack.pop();
            }
            var r = this.Tags.Current.length;
            this.Tags.pop();
            return r;
        }
        public signalOpenTag(tag: string) {
            tag = tag.toLowerCase();
            if (tag === 'script' || tag === 'style') {
                this._currentSpecial = {
                    Content: '',
                    Tag: tag,
                    Attrs: {}
                };
                this._result.SpecialTags.push(this._currentSpecial);
            } else {
                var t = this._constructor.element(this._stack.Current, tag);
                if (this._stack.Current == null) this._result.Roots.push(t);
                this._stack.push(t);
            }
            this.Tags.push(tag);
        }
        public signalAttr(name: string, value?: string) {
            if (this._currentSpecial != null) {
                this._currentSpecial.Attrs[name] = value;
            } else {
                this._constructor.attr(this._stack.Current, name, value);
            }
        }
        //#endregion

        //#region Caret

        private _idx: number = 0;
        private _start: number = 0;

        public next(range: number = 1): boolean {
            this._idx += range;
            return this._idx < this._html.length;
        }

        public fix() { this._start = this._idx; }
        public cut(): string { return this._html.substring(this._start, this._idx); }
        //#endregion

        //#region Testers
        public until(content: string): string {
            for (var i = 0; i < this._html.length - this._idx; i++) {
                if (this.isPiece(content, i)) {
                    return this._html.substring(this._idx, this._idx + i + 1);
                }
            }
            return this._html.substring(this._idx);
        }

        public isPiece(piece: string, ahead: number = 0): boolean {
            for (var i = 0; i < piece.length; i++) {
                if (this._idx + ahead + i > this._html.length - 1) return false;
                if (this._html[this._idx + ahead + i] !== piece[i]) return false;
            }
            return true;
        }

        public isTagOpening() { return this.isChar('<') && this.isEnAlpha(1); }

        public isNumber(ahead: number = 0): boolean {
            if (this._idx + ahead > this._html.length - 1) return false;
            if (this._idx + ahead < 0) return false;
            var c = this._html.charCodeAt(this._idx + ahead);
            return c >= 48 && c <= 57;
        }

        public isSpace(ahead: number = 0): boolean {
            if (this._idx + ahead > this._html.length - 1) return false;
            if (this._idx + ahead < 0) return false;
            var c = this._html.charCodeAt(this._idx + ahead);
            return c === 32 || c === 9 || c === 13 || c === 10;
        }

        public isEnAlpha(ahead: number = 0): boolean {
            if (this._idx + ahead > this._html.length - 1) return false;
            if (this._idx + ahead < 0) return false;
            var c = this._html.charCodeAt(this._idx + ahead);
            return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
        }

        public isChar(char: string, ahead: number = 0): boolean {
            if (this._idx + ahead > this._html.length - 1) return false;
            if (this._idx + ahead < 0) return false;

            var c = this._html.charCodeAt(this._idx + ahead);
            return char.charCodeAt(0) == c;
        }

        public char(ahead: number = 0): string {
            if (this._idx + ahead > this._html.length - 1) return null;
            if (this._idx + ahead < 0) return null;
            return this._html[this._idx + ahead];
        }

        //#endregion
    }
}