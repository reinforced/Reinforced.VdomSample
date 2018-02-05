module Reinforced.Lattice.Html {

    /**
     * HTML parser state
     */
    export enum State {
        /** Awaiting content, initial state */
        Content,

        /** Skipping space characters */
        SkipSpaces,

        /** Tag opening (from initial &lt; to tag name) */
        Tag,

        /** Crunching tag name and catching its closing */
        TagHeader,

        /** Crunching attribute name */
        AttrName,

        /** Awaiting attribute value */
        AttrValue,

        /** Crunching attribute value */
        AttrValueContent,

        /** Crunching comment */
        Comment
    }


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