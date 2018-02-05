module Reinforced.Lattice.Html {

    /**
     * Implementation of HTML constructor for real HTML elements
     */
    class HTMLDomConstructor implements Reinforced.Lattice.Html.IHtmlConstructor<Node> {
        private _div: HTMLElement = document.createElement('div');

        public element(parent: Node, tag: string): Node {
            var el = document.createElement(tag);
            if (parent != null) parent.appendChild(el);
            return <any>el;
        }

        public attr(element: Node, attrName: string, attrValue?: string): any {
            (element as HTMLElement).setAttribute(attrName, attrValue);
        }

        public content(parent: Node, content: string): Node {
            if (content.indexOf('&') > -1) {
                this._div.innerHTML = content;
                content = this._div.textContent;
                this._div.textContent = '';
            }
            var tnd = document.createTextNode(content);
            if (parent != null) parent.appendChild(tnd);
            return tnd;
        }

        public comment(parent: Node, content: string): Node {
            var tnd = document.createComment(content);
            if (parent != null) parent.appendChild(tnd);
            return tnd;
        }
    }

    export var DOMConstructor: Reinforced.Lattice.Html.IHtmlConstructor<Node> = new HTMLDomConstructor();
}