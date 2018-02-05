module Reinforced.Lattice.Html {

    /**
     * Stack implementation with bounds control based on JS array
     */
    export class Stack<T> {

        /**
         * Current element on the top of stack
         */
        public Current: T;
        private _stack: T[] = [];

        /**
         * Stack PUSH operation
         * @param val Value to push
         */
        public push(val: T): void {
            this._stack.push(val);
            this.Current = val;
        }

        /**
         * Stack POP operation. Does not return anything - just changes Current
         */
        public pop(): void {
            this._stack.pop();
            if (this._stack.length === 0) this.Current = null;
            else this.Current = this._stack[this._stack.length - 1];
        }
    }
}