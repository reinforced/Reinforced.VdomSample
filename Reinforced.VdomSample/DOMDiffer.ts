module Reinforced.Lattice.Html {

    interface IAddition {
        Before: Node;
        Node: IVDOMNode;
    }
    /**
     * Difference calculator between DOM and VDOM
     */
    export class DomDiffer {
        public static update(parent: Node, vnode: IVDOMNode[], cc: CompareCache) {
            var lcs = new Lcs(parent.childNodes as any, vnode, cc);
            var modBatch = lcs.produceModifyBatch();
            var additions: IAddition[] = [];
            var removals: Node[] = [];
            for (var i = 0; i < modBatch.length; i++) {
                if (modBatch[i].Action === ModAction.Remove) {
                    removals.push(modBatch[i].Node.Node);
                }
                if (modBatch[i].Action === ModAction.Add) {
                    additions.push({
                        Node: modBatch[i].Node.Node,
                        Before: parent.childNodes.item(modBatch[i].Index)
                    });
                }
                if (modBatch[i].Action === ModAction.Update) {
                    var nd = modBatch[i].Node.Node as IVDOMNode;
                    var src = modBatch[i].Source.Node as Node;
                    if ((!this.compareTypes(src, nd)) || ((src as HTMLElement).tagName !== nd.Tag)) {
                        removals.push(src);
                        additions.push({
                            Node: nd,
                            Before: src.nextSibling
                        });
                    } else {
                        if (nd.Type == VDOMNodeType.Element) {
                            this.updateAttributes(src as any, nd);
                            this.update(src, nd.Children, cc);
                        } else {
                            src.nodeValue = nd.Content;
                        }
                    }
                }
            }
            for (var j = 0; j < additions.length; j++) {
                var m = Lattice.Html.Materializer.materialize(additions[j].Node);
                if (!additions[j].Before) parent.appendChild(m);
                else parent.insertBefore(m, additions[j].Before);
            }

            for (var k = 0; k < removals.length; k++) {
                parent.removeChild(removals[k]);
            }
        }


        public static diff(e: Node, vnode: IVDOMNode[], cc: CompareCache) {
            var lcs = new Lcs(e.childNodes as any, vnode, cc);

            var modBatch = lcs.produceModifyBatch();

            for (var i = 0; i < modBatch.length; i++) {
                if (modBatch[i].Action == ModAction.Remove) {
                    console.log(`Remove ${modBatch[i].Node.Node} at ${modBatch[i].Index}`);
                }
                if (modBatch[i].Action == ModAction.Add) {
                    var addNode = modBatch[i].Node.Node as IVDOMNode;
                    if (addNode.Type == VDOMNodeType.Element) {
                        console.log(`Add ${addNode.Tag.toUpperCase()} at ${modBatch[i].Index}`);
                    }
                    if (addNode.Type == VDOMNodeType.Text) {
                        console.log(`Add text '${addNode.Content}' at ${modBatch[i].Index}`);
                    }
                    if (addNode.Type == VDOMNodeType.Comment) {
                        console.log(`Add comment '${addNode.Content}' at ${modBatch[i].Index}`);
                    }

                }
                if (modBatch[i].Action == ModAction.Update) {
                    var nd = modBatch[i].Node.Node as IVDOMNode;
                    var src = modBatch[i].Source.Node as Node;

                    if ((!this.compareTypes(src, nd)) || ((src as HTMLElement).tagName !== nd.Tag)) {
                        if (nd.Type == VDOMNodeType.Element) {
                            console.log(`Replace ${src} with ${nd.Tag}/${nd.Content}`);
                        } else if (nd.Type == VDOMNodeType.Text) {
                            console.log(`Replace ${src} with text ${nd.Content}`);
                        } else {
                            console.log(`Replace ${src} with comment ${nd.Content}`);
                        }
                    } else {
                        if (nd.Type == VDOMNodeType.Text) {
                            console.log(`Update text '${src.textContent}' -> '${nd.Content}' at ${modBatch[i].Index}`);
                        } else if (nd.Type == VDOMNodeType.Comment) {
                            console.log(
                                `Update comment '${src.textContent}' -> '${nd.Content}' at ${modBatch[i].Index}`);
                        } else {
                            console.log(`<additional ${(src as HTMLElement).tagName} at ${modBatch[i].Index}>`);
                            this.diff(src, nd.Children, cc);
                            console.log(`</additional>`);
                        }
                    }
                }
            }
        }


        private static compareTypes(e: Node, v: IVDOMNode) {
            if (e.nodeType == e.TEXT_NODE && v.Type == VDOMNodeType.Text) return true;
            if (e.nodeType == e.COMMENT_NODE && v.Type == VDOMNodeType.Comment) return true;
            return (e.nodeType == e.ELEMENT_NODE && v.Type == VDOMNodeType.Element);
        }

        private static updateNode(e: Node, vnode: IVDOMNode) {
            this.updateAttributes(e as HTMLElement, vnode);
        }

        private static updateAttributes(element: HTMLElement, vnode: IVDOMNode) {
            var e = element.attributes;
            var vAttrs = vnode.Attributes;
            var modify: { [_: string]: boolean } = {}; //true = update,false = remove

            for (var i = 0; i < e.length; i++) {
                var kv = e.item(i);
                if (vAttrs.hasOwnProperty(kv.name)) {
                    if (kv.value !== vAttrs[kv.name]) {
                        modify[kv.name] = true;
                    }
                } else {
                    element.removeAttribute(kv.name);
                    modify[kv.name] = false;
                }
            }

            for (var k in vAttrs) {
                if (!modify.hasOwnProperty(k)) {
                    modify[k] = true;
                }
            }

            for (var k in modify) {
                if (modify[k]) {
                    element.setAttribute(k, vAttrs[k]);
                } else {
                    element.removeAttribute(k);
                }
            }
        }
    }
}