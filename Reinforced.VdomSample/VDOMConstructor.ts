module Reinforced.Lattice.Html {

    /**
     * VDOM node type
     */
    export enum VDOMNodeType {

        /** Element node */
        Element,

        /** Text node */
        Text,

        /** Comment node */
        Comment
    }

    /**
     * VDOM node interface
     */
    export interface IVDOMNode {

        /** Node tag */
        Tag: string;

        /** Node type */
        Type: VDOMNodeType;

        /** Content */
        Content: string;

        /** Node children */
        Children: IVDOMNode[];

        /** Node attributes */
        Attributes: { [_: string]: string };

        /** Count of node's attributes */
        AttributesCount: number;
    }



    class VirtualDOMConstructor implements Reinforced.Lattice.Html.IHtmlConstructor<IVDOMNode> {

        private _div: HTMLElement = document.createElement('div');

        public element(e: IVDOMNode, t: string): IVDOMNode {
            var el: IVDOMNode = {
                Tag: t.toUpperCase(),
                Content: null,
                Children: [],
                Type: VDOMNodeType.Element,
                Attributes: {},
                AttributesCount: 0
            };
            if (e != null) e.Children.push(el);
            return el;
        }

        public attr(e: IVDOMNode, n: string, v?: string): any {
            e.Attributes[n] = v;
            e.AttributesCount++;
        }

        public content(e: IVDOMNode, c: string): IVDOMNode {
            if (c.indexOf('&') > -1) {
                this._div.innerHTML = c;
                c = this._div.textContent;
                this._div.textContent = '';
            }
            var tnd: IVDOMNode = {
                Tag: null,
                Content: c,
                Children: null,
                Type: VDOMNodeType.Text,
                Attributes: null,
                AttributesCount: 0
            };
            if (e != null) e.Children.push(tnd);
            return tnd;
        }

        public comment(e: IVDOMNode, c: string): IVDOMNode {
            var tnd: IVDOMNode = {
                Tag: null,
                Content: c,
                Children: null,
                Type: VDOMNodeType.Comment,
                Attributes: null,
                AttributesCount: 0
            };
            if (e != null) e.Children.push(tnd);
            return tnd;
        }
    }

    export var VDOMConstructor = new VirtualDOMConstructor();
}