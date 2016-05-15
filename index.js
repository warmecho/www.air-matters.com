

var Page = {
    width: document.body.clientWidth || document.documentElement.clientWidth,
    height: document.body.clientHeight || document.documentElement.clientHeight
};



var iphoneCtrl = {
    el: document.getElementById('iphone'),

    init: function () {
        scrollCtrl.add({
            el: this.el,
            fn: {
                0: function (percent, index) {
                    percent = percent > 0.5 ? (percent - 0.5) * 2 : 0;

                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: Page.height * 2 - 200 * percent,
                        opacity: percent,
                    });
                },

                1: function (percent, index) {
                    var start = Page.height * 2 - 200;
                    var end = Page.height * 3 - 300;
                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: start + (end - start) * percent,
                        opacity: 1,
                    });
                },

                2: function (percent, index) {
                    var end = Page.height * 4 - 400;
                    var start = Page.height * 3 - 300;
                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: start + (end - start) * percent,
                        opacity: 1,
                    });
                },

                3: function (percent, index) {
                    var start = Page.height*4 - 400;
                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: start + percent * -700,
                        opacity: 1 - percent,
                    });
                }
            }
        });
    }
};


var scrollCtrl = {
    items: [],

    init: function () {
        scrollCtrl.refreshView();
        window.onscroll = scrollCtrl.refreshView;
    },

    add: function (item) {
        this.items.push(item);
    },

    refreshView: function () {
        var scrollTop = document.body.scrollTop;
        var pageIndex = Math.floor(scrollTop / Page.height);
        var pageOffset = scrollTop - Page.height * pageIndex;
        var pageOffsetPercent = pageOffset / Page.height;

        for (var i = 0; i < scrollCtrl.items.length; i++) {
            var item = scrollCtrl.items[i];
            var fn = item.fn[pageIndex];

            if (typeof fn === 'function') {
                var styles = fn.call(item, pageOffsetPercent, pageIndex);
                setStyles(item.el, styles);
            }
        }
    }
};

function SectionView(main) {
    var sections = main.getElementsByTagName('section');
    this.sections = sections;
    this.len = sections.length;
    for (var i = 0; i < this.len; i++) {
        var section = sections[i];
        if (section.id.indexOf('home') >= 0) {
            this.homeIndex = i;
            this.currentIndex = i;
            section.style.opacity = 1;
        }
    }

    var ctrlEl = document.createElement('div');
    ctrlEl.className = 'section-ctrl'
    main.parentNode.appendChild(ctrlEl);
    var ctrlHtmlEl = document.getElementById('section-ctrl-btn');
    ctrlEl.innerHTML = ctrlHtmlEl.textContent || ctrlHtmlEl.innerText;

    var btns = ctrlEl.getElementsByTagName('svg');
    this.prevBtn = btns[0];
    this.nextBtn = btns[1];
    btns[0].onclick = prevSection(this);
    btns[1].onclick = nextSection(this);
}

SectionView.prototype.next = function () {
    var from = this.currentIndex;
    var to = from + 1;
    var fromEl = this.sections[from];
    var toEl = this.sections[to];

    if (to < this.len) {
        var steps = 50;
        var step = 0;

        this.currentIndex = to;

        function stepFn() {
            step ++;
            if (step > steps) {
                return;
            }

            var percent = Math.sqrt(step / steps);

            var fromOpacity = 1 - percent;
            var fromX = -(Page.width * percent);
            var toOpacity = percent;
            var toX = Page.width - (Page.width * percent);
            
            setStyles(
                fromEl,
                transformStyle({
                    translateX: fromX,
                    opacity: fromOpacity
                })
            );
            setStyles(
                toEl,
                transformStyle({
                    translateX: toX,
                    opacity: toOpacity
                })
            );

            setTimeout(stepFn, 4);
        }

        stepFn();
    }
};

SectionView.prototype.prev = function () {
    var from = this.currentIndex;
    var to = from - 1;
    var fromEl = this.sections[from];
    var toEl = this.sections[to];

    if (to >= 0) {
        var steps = 50;
        var step = 0;

        this.currentIndex = to;

        function stepFn() {
            step ++;
            if (step > steps) {
                return;
            }

            var percent = Math.sqrt(step / steps);

            var fromOpacity = 1 - percent;
            var fromX = Page.width * percent;
            var toOpacity = percent;
            var toX = -Page.width + (Page.width * percent);
            
            setStyles(
                fromEl,
                transformStyle({
                    translateX: fromX,
                    opacity: fromOpacity
                })
            );
            setStyles(
                toEl,
                transformStyle({
                    translateX: toX,
                    opacity: toOpacity
                })
            );

            setTimeout(stepFn, 4);
        }

        stepFn();
    }
};

function nextSection(sectionView) {
    return function () {
        sectionView.next();
    };
}

function prevSection(sectionView) {
    return function () {
        sectionView.prev();
    };
}

scrollCtrl.add({
    el: document.getElementById('airmatter-main'),
    fn: {
        1: function (percent) {
            percent = percent > 0.5 ? (percent - 0.5) * 2 : 0;
            return {
                transform: 'translateY(' + (200 - percent * 200) + 'px)',
                opacity: percent,
            };
        },

        2: function (percent) {
            percent = percent < 0.5 ? percent * 2 : 1;
            return {
                transform: 'translateY(' + ( percent * -100) + 'px)',
                opacity: 1 - percent,
            };
        }
    }
});


scrollCtrl.add({
    el: document.getElementById('service-main'),
    fn: {
        2: function (percent) {
            percent = percent > 0.5 ? (percent - 0.5) * 2 : 0;
            return transformStyle({
                translateY: 200 - percent * 200,
                opacity: percent,
            });
        },

        3: function (percent) {
            percent = percent < 0.5 ? percent * 2 : 1;
            return transformStyle({
                translateY: percent * -200,
                opacity: 1 - percent,
            });
        }
    }
});

iphoneCtrl.init();
scrollCtrl.init();
new SectionView(document.getElementById('airmatter-main'));
new SectionView(document.getElementById('service-main'));

function setStyles(el, styles) {
    for (var key in styles) {
        el.style[key] = styles[key];
    }
}

function transformStyle(style) {
    var transformStr = [];
    var result = {};

    for (var key in style) {
        switch (key) {
            case 'translateX':
            case 'translateY':
                transformStr.push(key + '(' + style[key] + 'px)');
                break;
            default: 
                result[key] = style[key];
        }
    }

    if (transformStr.length > 0) {
        result.transform = transformStr.join(' ');
    }

    return result;
}
