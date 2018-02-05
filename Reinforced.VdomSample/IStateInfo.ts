module Reinforced.Lattice.Html {
    export interface IStateInfo {
        /**
         * Action to be performed single time when entering state
         * @param ctx Context
         * @param prevState Previous state
         * @returns {} 
         */
        enter: (ctx: IParseContext, prevState: State) => void;

        /**
         * Action to be performed for each symbol coming from input HTML stream
         * @param ctx Context
         * @returns {} 
         */
        do: (ctx: IParseContext) => State;

        /**
         * Action to be performed single time when exiting state
         * @param ctx Context
         * @param nextState Next state
         * @returns {} 
         */
        exit: (ctx: IParseContext, nextState: State) => void;
    }
}