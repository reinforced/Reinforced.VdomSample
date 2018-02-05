module Reinforced.Lattice.Html {
    /**
     * Difference detection algorithm based on standard Longest Common Subsequence search algorith and dynamic programming
     * https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
     */
    export class Lcs {
        private _dynamicMatrix: number[][];
        private _base: IIndexed<Node>[];
        private _modified: IIndexed<IVDOMNode>[];
        private _cc: CompareCache;

        /**
         * Constructs new LCS algorithm setup
         * @param base Sequence of real DOM nodes (BASE)
         * @param modified Sequence of VDOM nodes (MODIF)
         * @param cc Comparison cache
         */
        constructor(base: Node[], modified: Reinforced.Lattice.Html.IVDOMNode[], cc: CompareCache) {
            this._cc = cc;
            // First, we skip identical nodes from both edges of sequences:
            // |....+++--....|
            // |....++---...|
            // |^^^^     ^^^| < these parts has to be striped to:
            // |++---.|
            // |+++--.|
            this.doSkips(base, modified);
        }

        /**
         * Calculates set of modifications that should be applied to BASE to get MODIF
         */
        public produceModifyBatch(): IBatchEntry[] {
            if (this._base.length === 0 && this._modified.length === 0) return [];
            if (this._base.length === 0) return this.all(ModAction.Add);
            if (this._modified.length === 0) return this.all(ModAction.Remove);

            if (this._base.length === 1 && this._modified.length === 1) {
                if (!this.compare(this._base[0].Node, this._modified[0].Node)) {
                    return [
                        {
                            Node: this._modified[0],
                            Source: this._base[0],
                            Index: this._base[0].Index,
                            Action: ModAction.Update
                        }
                    ];
                } else {
                    return [];
                }
            }

            this.doMatrix();
            var result: IBatchEntry[] = [];

            this.processModifyBatch(result, this._base.length, this._modified.length);
            return this.normalizeBatch(result);
        }

        /**
         * Produces modifications batch which contains only removal or 
         * @param action
         */
        private all(action: ModAction): IBatchEntry[] {
            var bsArr = action === ModAction.Add ? this._modified : this._base;
            var r: IBatchEntry[] = [];
            for (var i = 0; i < bsArr.length; i++) {
                r.push({
                    Node: action === ModAction.Add ? this._modified[i] : this._base[i],
                    Source: null,
                    Index: action === ModAction.Add ? this._modified[i].Index : this._base[i].Index,
                    Action: action
                });
            }
            return r;
        }

        /**
         * Normalizes modification batch.
         * If Addition follows Removal (or vice versa) at the same index - it means that they must be
         * merged to single UPDATE at this index
         * 
         * @param lines Raw modifications batch
         */
        private normalizeBatch(lines: IBatchEntry[]) {
            var result: IBatchEntry[] = [];
            var maxLen = lines.length;
            for (var i = 0; i < maxLen; i++) {
                if (
                    (i + 1 < maxLen)
                        && (lines[i + 1].Action !== lines[i].Action)
                        && (lines[i + 1].Index === lines[i].Index)
                ) {
                    var addition: IBatchEntry = null;
                    var substraction: IBatchEntry = null;
                    if (lines[i].Action === ModAction.Add) {
                        addition = lines[i];
                        substraction = lines[i + 1];
                    }
                    else {
                        addition = lines[i + 1];
                        substraction = lines[i];
                    }
                    addition.Action = ModAction.Update;
                    addition.Source = substraction.Node;
                    result.push(addition);
                    i++;
                }
                else {
                    var oldLine = lines[i];
                    result.push(oldLine);
                }
            }
            return result;
        }

        /**
         * Outputs DP matrix to console.
         * This method is for debug usage only
         */
        private matrix() {
            if (!this._dynamicMatrix) {
                console.log("No matrix");
                return;
            }
            for (var i = 0; i < this._dynamicMatrix.length; i++) {
                console.log(this._dynamicMatrix[i].join(', '));
            }
        }

        /**
         * Recursively calculates basic version of modifications batch.
         * It is raw data that should not be used because Additions and Removals that are
         * standing following each other must be merged to single Update
         * 
         * @param result Modifications batch (empty from beginning)
         * @param mi DP matrix COLUMN index to start from (largest is to start from initially)
         * @param mj DP matrix ROW index to start from (largest is to start from initially)
         */
        private processModifyBatch(result: IBatchEntry[], mi: number, mj: number) {
            var baseCoord = mi - 1;
            var modifCoord = mj - 1;
            if (baseCoord < 0) baseCoord = 0;
            if (modifCoord < 0) modifCoord = 0;

            var equal = this._modified.length !== 0
                && this._base.length !== 0
                && this.compare(this._base[baseCoord].Node, this._modified[modifCoord].Node);

            if (mi > 0 && mj > 0 && equal) this.processModifyBatch(result, mi - 1, mj - 1);
            else {
                if (mj > 0 && (mi === 0 || this.mxGt(mi, mj))) {

                    this.processModifyBatch(result, mi, mj - 1);
                    result.push({
                        Action: ModAction.Add,
                        Node: this._modified[modifCoord],
                        Source: null,
                        Index: this._modified[modifCoord].Index
                    });

                }
                else if (mi > 0 && (mj === 0 || this.mxLt(mi, mj))) {
                    this.processModifyBatch(result, mi - 1, mj);
                    result.push({
                        Action: ModAction.Remove,
                        Node: this._base[baseCoord],
                        Source: null,
                        Index: this._base[baseCoord].Index
                    });
                }
            }
        }

        /**
         * Retrieves LCS matrix value standint at specified row and column
         * @param i COLUMN
         * @param j ROW
         */
        private mx(i: number, j: number) {
            if (i < 0) return NaN;
            if (j < 0) return NaN;
            return this._dynamicMatrix[i][j];
        }

        /**
         * Compares values standing at the both sides of specified matrix cell (less than)
         *   _____________
         *  |  _  |   B   | j-1
         *  |  A  |  i, j |
         *   -------------
         *    i-1
         * 
         * Returns true if B < A. Means REMOVAL
         * 
         * @param i COLUMN
         * @param j ROW
         */
        private mxLt(i: number, j: number): boolean {
            return this.mx(i, j - 1) < this.mx(i - 1, j);
        }


        /**
         * Compares values standing at the both sides of specified matrix cell (greater than)
         *   _____________
         *  |  _  |   B   | j-1
         *  |  A  |  i, j |
         *   -------------
         *    i-1
         * 
         * Returns true if B > A. Means ADDITION
         * 
         * @param i COLUMN
         * @param j ROW
         */
        private mxGt(i: number, j: number): boolean {
            return this.mx(i, j - 1) >= this.mx(i - 1, j);
        }

        /**
         * Shortland for comparing 2 nodes
         * @param e DOM node
         * @param v VDOM node
         */
        private compare(e: Node, v: IVDOMNode): boolean {
            return this._cc.compare(e, v);
        }

        /**
         * Builds DP matrix to find LCS
         */
        private doMatrix() {
            var baseLen = this._base.length;
            var modifLen = this._modified.length;

            this._dynamicMatrix = [];
            for (var k = 0; k < baseLen + 1; k++) {
                var a = [];
                for (var l = 0; l < modifLen + 1; l++) {
                    a.push(0);
                }
                this._dynamicMatrix.push(a);
            }

            for (var i = 0; i < baseLen; i++) {
                for (var j = 0; j < modifLen; j++) {
                    var equal = this.compare(this._base[i].Node, this._modified[j].Node);

                    this._dynamicMatrix[i + 1][j + 1] = equal ?
                        this._dynamicMatrix[i][j] + 1 :
                        Math.max(this._dynamicMatrix[i][j + 1], this._dynamicMatrix[i + 1][j]);
                }
            }
        }

        /**
         * Removes identical nodes from both edges if base and modified nodes arrays
         * @param base Base nodes array
         * @param modified Modified nodes array
         */
        private doSkips(base: Node[], modified: Reinforced.Lattice.Html.IVDOMNode[]) {
            if (base.length === 0) {
                this._modified = this.toIndexed(modified);
                this._base = [];
                return;
            }
            else if (modified.length === 0) {
                this._base = this.toIndexed(base);
                this._modified = [];
                return;
            }

            var baseLen = base.length;
            var modifLen = modified.length;

            var minLen = Math.min(baseLen, modifLen);

            var startSkipDone = false;
            var endSkipDone = false;

            var node: Node = null;
            var vnode: IVDOMNode = null;
            var startSkip = 0;
            var endSkip = 0;

            var i = 0;
            while ((!startSkipDone) && i < minLen) {
                node = base[i];
                vnode = modified[i];
                if (!this.compare(node, vnode)) startSkipDone = true;
                else startSkip++;
                i++;
            }

            if (baseLen === modifLen) {
                i = 0;
                while ((!endSkipDone) && i < minLen) {
                    node = base[baseLen - i - 1];
                    vnode = modified[modifLen - i - 1];
                    if (!this.compare(node, vnode)) endSkipDone = true;
                    else endSkip++;
                    i++;
                }
            }

            this._base = this.toIndexed(base, startSkip, base.length - endSkip);
            this._modified = this.toIndexed(modified, startSkip, modified.length - endSkip);
        }

        /**
         * Generic helper function turning array of nodes to indexed ones to avoid redundant .indexOf calls
         * and to preserve indicies
         * @param arr Source array
         * @param start Starting index
         * @param end End index
         */
        private toIndexed<T>(arr: T[], start: number = 0, end: number = arr.length): IIndexed<T>[] {
            var r: IIndexed<T>[] = [];
            for (var j = start; j < end; j++) {
                r.push({
                    Node: arr[j],
                    Index: j
                });
            }
            return r;
        }
    }
}