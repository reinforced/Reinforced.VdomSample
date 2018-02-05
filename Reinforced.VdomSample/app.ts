class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public parseHtml() {
        var parser = new Reinforced.Lattice.Html.HtmlParser(Reinforced.Lattice.Html.DOMConstructor);
        var txt = document.getElementById('htmlText') as HTMLTextAreaElement;
        var r = parser.parse(txt.value);

        this.element.innerHTML = '';
        for (var i = 0; i < r.Roots.length; i++) {
            this.element.appendChild(r.Roots[i]);
        }
    }

    public diffHtml() {
        var parser = new Reinforced.Lattice.Html.HtmlParser(Reinforced.Lattice.Html.VDOMConstructor);
        var txt = document.getElementById('htmlText') as HTMLTextAreaElement;
        var r = parser.parse(txt.value);
        Reinforced.Lattice.Html.DomDiffer.diff(this.element, r.Roots, new Reinforced.Lattice.Html.CompareCache());
    }

    public updateHtml() {
        var parser = new Reinforced.Lattice.Html.HtmlParser(Reinforced.Lattice.Html.VDOMConstructor);
        var txt = document.getElementById('htmlText') as HTMLTextAreaElement;
        var r = parser.parse(txt.value);
        Reinforced.Lattice.Html.DomDiffer.update(this.element, r.Roots, new Reinforced.Lattice.Html.CompareCache());
    }
}



window.onload = () => {
    var el = document.getElementById('content');
    var g = new Greeter(el);

    var btn = document.getElementById('doParse');
    var btn2 = document.getElementById('doDiff');
    var btn3 = document.getElementById('doUpdate');
    var txt = document.getElementById('htmlText');

    btn.onclick = function (e) {
        g.parseHtml();
    };
    btn2.onclick = function (e) {
        g.diffHtml();
    };
    btn3.onclick = function (e) {
        g.updateHtml();
    };

    txt.onkeyup = function(e) {
        if (window['upd']()) g.updateHtml();
        else if (window['prs']()) g.parseHtml();
    };
};