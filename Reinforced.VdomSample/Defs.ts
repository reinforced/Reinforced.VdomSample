module Reinforced.Lattice.Html {
    //#region HTML parser entities

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

    
    /**
     * Interface for nodes (DOM or VDOM) constructor
     */

    /**
     * HTML Elements parsering result
     */
    export interface IParseResult<T> {
        /**
         * Root elements
         */
        Roots: T[];

        /**
         * Script and style tags metadata
         */
        SpecialTags: ISpecialTag[];
    }

    /**
     * Script or style tag metadata
     */
    export interface ISpecialTag {
        /**
         * Tag name
         */
        Tag: string;

        /**
         * Attributes
         */
        Attrs: { [_: string]: string };

        /**
         * Script or style tag content
         */
        Content: string;
    }

    /**
     * Interface for driving parsering process
     */
    export interface IParseContext {
        Tags: Stack<string>;

        // temp variables
        attrName: string;
        attrVal: string;
        afterSkip: State;
        quote: string;

        //signals 

        signalContent(content: string);
        signalComment(content: string);
        signalCloseTag(tag: string);
        signalOpenTag(tag: string);
        signalAttr(name: string, value?: string);

        next(range?: number): void;
        fix(): void;
        cut(): string;

        //checks
        isTagOpening(): boolean;
        isPiece(piece: string, ahead?: number): boolean;
        isNumber(ahead?: number): boolean;
        isEnAlpha(ahead?: number): boolean;
        isSpace(ahead?: number): boolean;
        isChar(char: string, ahead?: number): boolean;
        char(ahead?: number): string;
    }

    /**
     * HTML parser state machine's state
     */

    //#endregion

    //#region DOM differ entities

    /**
     * Action type that batch entry denotes to be applied to DOM node
     */
    export enum ModAction {
        /**
         * %Node% field contains VDOM node. It should be materialized and inserted BEFORE node at %Index% position
         */
        Add,

        /**
         *  %Node% contains DOM node. It should be removed from BASE
         */
        Remove,

        /**
         * %Node% contains DOM node. It should be updated to correspond VDOM node
         */
        Update
    }

    /**
     * Wrapper for DOM/VDOM node with its index
     */
    export interface IIndexed<T> {

        /**
         * DOM/VDOM Node
         */
        Node: T;

        /**
         * Index
         */
        Index: number;
    }

    /**
     * DOM diff. modification batch entry
     */
    export interface IBatchEntry {
        /**
         * Node that action should be performed on
         */
        Node: IIndexed<any>;

        /**
         * Reference node (used for Update only - in other cases is null)
         */
        Source: IIndexed<any>;

        /**
         * Action that should be applied to Node
         */
        Action: ModAction;

        /**
         * Index of action to be performed
         */
        Index: number;
    }
    //#endregion
}