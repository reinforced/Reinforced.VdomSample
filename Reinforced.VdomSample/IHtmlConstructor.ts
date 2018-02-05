module Reinforced.Lattice.Html {
    export interface IHtmlConstructor<T> {
        /**
         * Creates element
         * @param parent Parent element (may be null)
         * @param tag Tag name (lowercase)
         * @returns {T} Created element appended to parent
         */
        element(parent: T, tag: string): T;

        /**
         * Changes/adds attribute to element
         * @param element Element, subject
         * @param name Attribute name
         * @param value Attribute value
         */
        attr(element: T, name: string, value?: string): void;

        /**
         * Appends text content to specified element
         * @param parent Parent element (may be null)
         * @param content String content
         * @returns {T} Text element
         */
        content(parent: T, content: string): T;

        /**
         * Appends comment node to specified element
         * @param parent Parent element (may be null)
         * @param content Comment content
         * @returns {T} Comment element
         */
        comment(parent: T, content: string): T;
    }
}