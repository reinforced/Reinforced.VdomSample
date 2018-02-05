module Reinforced.Lattice.Html {
    interface IComparison {
        VDom: IVDOMNode[];
        Result: boolean[];
    }

    /**
     * Comparison cache for speeding up comparison between DOM and VDOM nodes
     */
    export class CompareCache {

        private _nodes: Node[] = [];
        private _results: { [_: number]: IComparison } = {};

        /**
         * Compares DOM node to VDOM node
         * @param e DOM node
         * @param v Corresponding VDOM node
         */
        public compare(e: Node, v: IVDOMNode): boolean {
            var r = this.retrieve(e, v);
            if (r != null) return r;
            r = true;
            if (e.nodeType === e.TEXT_NODE && v.Type !== VDOMNodeType.Text) r = false;
            else if (e.nodeType === e.COMMENT_NODE && v.Type !== VDOMNodeType.Comment) r = false;
            else if (e.nodeType === e.ELEMENT_NODE && v.Type !== VDOMNodeType.Element) r = false;
            else if (e.nodeType === e.TEXT_NODE && v.Type === VDOMNodeType.Text) {
                r = e.textContent === v.Content;
            } else if (e.nodeType === e.COMMENT_NODE && v.Type === VDOMNodeType.Comment) {
                r = e.textContent === v.Content;
            }
            if (e.nodeType === e.ELEMENT_NODE && v.Type === VDOMNodeType.Element) {
                if (r)
                if (e.attributes.length !== v.AttributesCount) {
                    r = false;
                }


                if (r)
                    for (var i = 0; i < e.attributes.length; i++) {
                        var at = e.attributes[i];
                        if ((!v.Attributes.hasOwnProperty(at.name)) || v.Attributes[at.name] !== at.value) {
                            r = false;
                            break;
                        }
                    }
                if (!e.attributes.getNamedItem('data-vd')) {
                    if (r) if (e.childNodes.length !== v.Children.length) r = false;
                    if (r)
                        for (var j = 0; j < e.childNodes.length; j++) {
                            if (!this.compare(e.childNodes[j], v.Children[j])) {
                                r = false;
                                break;
                            }
                        }
                }
            }
            this.store(e, v, r);
            return r;
        }

        /**
         * Retrieves cached comparison result between 2 nodes
         * @param e DOM node
         * @param v Corresponding VDOM node
         */
        private retrieve(e: Node, vnode: IVDOMNode): any {
            var idx = this._nodes.indexOf(e);
            if (idx === -1) return null;
            var cmp = this._results[idx];
            idx = cmp.VDom.indexOf(vnode);
            if (idx === -1) return null;
            return cmp.Result[idx];
        }

        public _entries: number = 0;

        /**
         * Stores comparison result in cache
         * @param e DOM node
         * @param v Corresponding VDOM node
         * @param result Comparison result
         */
        private store(e: Node, vnode: IVDOMNode, result: boolean) {
            this._entries++;
            var idx = this._nodes.indexOf(e);
            if (idx === -1) {
                idx = this._nodes.length;
                this._nodes.push(e);
            }
            var cmp = this._results[idx];
            if (!cmp) {
                cmp = {
                    VDom: [],
                    Result: []
                };
                this._results[idx] = cmp;
            }
            cmp.VDom.push(vnode);
            cmp.Result.push(result);
        }
    }
}