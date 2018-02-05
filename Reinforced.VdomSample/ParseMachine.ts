// ReSharper disable NotAllPathsReturnValue
module Reinforced.Lattice.Html {

    /**
     * Tags that are allowed to be self-closed
     */
    var selfClose = ['area', 'base', 'br', 'col', 'command', 'embed',
        'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param',
        'source', 'track', 'wbr'];

    /**
     * Definition of HTML parser state machine.
     * State machine signals particular states back to parser (abstracted under IParseContext)
     */
    export var _parseMachine: { [_: number]: Reinforced.Lattice.Html.IStateInfo } = {};

    /**
     * Initial state. Crunching text, awaiting opening tag
     */
    _parseMachine[State.Content] = {
        enter: c => c.fix(),
        exit: c => c.signalContent(c.cut()),
        do: (c) => {
            if (c.isPiece('<!--')) return State.Comment;
            else if (c.isTagOpening()) return State.Tag;
            else if (c.isPiece('</') && c.Tags.Current != null) {
                c.signalContent(c.cut());
                var l = c.signalCloseTag(c.Tags.Current);
                c.next(3 + l);
                c.fix();
                c.next(-1);
                return State.Content;
            }

        }
    };

    /**
     * State when crunching content from &lt;-- to --&gt;
     */
    _parseMachine[State.Comment] = {
        enter: c => { c.next(4); c.fix(); },
        exit: c => { c.signalComment(c.cut()); c.next(3); },
        do: (c) => {
            if (c.isPiece('-->')) return State.Content;
        }
    };

    /**
     * State when skipping space characters awaiting atribute quote or anything similar
     */
    _parseMachine[State.SkipSpaces] = {
        enter: null, exit: c => c.afterSkip = null,
        do: (c) => c.isSpace() ? State.SkipSpaces : c.afterSkip
    };

    /**
     * State when opening tag - between initial &lt; and tag name
     */
    _parseMachine[State.Tag] = {
        enter: c => { c.next(); c.fix(); },
        exit: c => c.signalOpenTag(c.cut()),
        do: (c) => {
            if (!(c.isEnAlpha() || c.isNumber())) return State.TagHeader;
        }
    };

    /**
     * Tag header - text between opening &lt; and space or &gt; or even /&gt;.
     * In case if space got after tag name with following letter - then machine will expect attr. name
     */
    _parseMachine[State.TagHeader] = {
        enter: null, exit: null,
        do: (c) => {
            if (c.isEnAlpha()) return State.AttrName;
            if (c.isPiece('/>')) {
                c.next(2);
                c.signalCloseTag(c.Tags.Current);
                return State.Content;
            }
            if (c.isPiece('>')) {
                if (selfClose.indexOf(c.Tags.Current) !== -1) {
                    c.signalCloseTag(c.Tags.Current);
                }
                c.next();
                return State.Content;
            }
        }
    };

    /**
     * State when machine is crunching attribute.
     * It also allows ':' and '-' symbols inside attribute name.
     * Also this state will crunch attribute with empty value if encounters '&gt;' or '/&gt;'
     */
    _parseMachine[State.AttrName] = {
        enter: c => { c.fix(); c.attrName = null; c.attrVal = null; }, exit: null,
        do: (c) => {
            if (c.isChar('>') || c.isPiece('/>')) {
                c.signalAttr(c.cut(), null);
                return State.TagHeader;
            }
            if (!(c.isEnAlpha() || c.isChar('-') || c.isChar(':'))) {
                c.attrName = c.cut();
                c.afterSkip = State.AttrValue;
                return State.SkipSpaces;
            }
        }
    };

    /**
     * State happening right after attribute name
     * Expects '=' with or w/o following quote or tag header closing
     */
    _parseMachine[State.AttrValue] = {
        enter: null, exit: null,
        do: (c) => {
            if (c.isEnAlpha()) {
                c.signalAttr(c.attrName, c.attrVal);
                return State.AttrName;
            }
            if (c.isChar('>') || c.isPiece('/>')) return State.TagHeader;
            if (c.isChar('=')) {
                c.next();
                c.afterSkip = State.AttrValueContent;
                return State.SkipSpaces;
            }
        }
    };

    /**
     * Crunches tag attribute value. From initial single/double quote to trailing corresponding quote.
     * Also stops when no quote and space or tag header closing encountered
     */
    _parseMachine[State.AttrValueContent] = {
        enter: null, exit: null,
        do: (c) => {
            if (c.quote == null && (c.isChar("'") || c.isChar('"') || c.isEnAlpha())) {
                c.quote = c.isEnAlpha() ? ' ' : c.char();
                c.next();
                c.fix();
            }
            if (
                (c.quote === ' ' && (c.isSpace() || c.isChar('/') || c.isChar('>')))
                    || (c.quote != null && c.isChar(c.quote))
            ) {
                c.attrVal = c.cut();
                if (c.quote !== ' ') c.next();
                c.quote = null;
                c.signalAttr(c.attrName, c.attrVal);
                return State.TagHeader;
            }
            return State.AttrValueContent;
        }
    };
}