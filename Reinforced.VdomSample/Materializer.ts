module Reinforced.Lattice.Html {

    /**
     * VDOM node materializer     * 
     */
    export class Materializer {

        /**
         * Turns virtual DOM node into real one
         * 
         * @param vnode VDOM node
         *
         * @returns {Node} Real HTML node
         */
        public static materialize(vnode: IVDOMNode): Node {
            if (vnode.Type === VDOMNodeType.Comment) return this.materializeComment(vnode);
            if (vnode.Type === VDOMNodeType.Element) return this.materializeElement(vnode);
            if (vnode.Type === VDOMNodeType.Text) return this.materializeText(vnode);
            throw new Error('Unknown node type');
        }

        private static materializeElement(vnode: IVDOMNode): Node {
            var e = document.createElement(vnode.Tag);
            for (var attrName in vnode.Attributes) {
                if (vnode.Attributes.hasOwnProperty(attrName)) {
                    e.setAttribute(attrName, vnode.Attributes[attrName]);
                }
            }
            for (var i = 0; i < vnode.Children.length; i++) {
                var nd = this.materialize(vnode.Children[i]);
                e.appendChild(nd);
            }
            return e;
        }
        private static materializeText(vnode: IVDOMNode): Node {
            return document.createTextNode(vnode.Content);
        }
        private static materializeComment(vnode: IVDOMNode): Node {
            return document.createComment(vnode.Content);
        }
    }
}