

var Page = {}
function calcPageSize() {
    Page.width = document.body.clientWidth || document.documentElement.clientWidth;
    Page.height = Math.max(640, document.body.clientHeight || document.documentElement.clientHeight);
}

calcPageSize();


var iphoneCtrl = {
    el: document.getElementById('iphone'),
    screenEl: document.getElementById('iphone-screen'),

    init: function () {
        scrollCtrl.add({
            el: this.el,
            fn: {
                0: function (percent, index) {
                    // percent = percent > 0.5 ? (percent - 0.5) * 2 : 0;
                    var start = Page.height;
                    var end = Page.height * 2 - 330;

                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: Math.round(start + (end - start) * percent),
                        opacity: percent,
                    });
                },

                1: function (percent, index) {
                    var start = Page.height * 2 - 330;
                    var end = Page.height * 3 - 420;
                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: Math.round(start + (end - start) * percent),
                        opacity: 1,
                    });
                },

                2: function (percent, index) {
                    var end = Page.height * 4 - 420;
                    var start = Page.height * 3 - 420;
                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: Math.round(start + (end - start) * percent),
                        opacity: 1,
                    });
                },

                3: function (percent, index) {
                    percent = percent * 2;
                    if (percent > 1) {
                        percent = 1;
                    }

                    var start = Page.height*4 - 420;
                    var end = Page.height*4 - 600;
                    return transformStyle({
                        translateX: (Page.width - 290) / 2,
                        translateY: Math.round(start + (end - start) * percent),
                        opacity: 1 - percent,
                    });
                }
            }
        });
    },

    cleanScreen: function () {
        iphoneCtrl.screenEl.innerHTML = '';
    },

    addContent: function (el) {
        iphoneCtrl.screenEl.appendChild(el);
    }
};

var mapCtrl = {
    init: function () {
        scrollCtrl.add({
            el: document.getElementById('world-map-wrap'),
            fn: {
                0: function (percent, index) {
                    return transformStyle({
                        translateY: Math.round(Page.height * percent),
                    });
                },

                1: function (percent, index) {
                    return transformStyle({
                        translateY: Math.round(Page.height),
                        opacity: 1 - percent,
                    });
                }
            }
        });
    }
};

var searchCtrl = {
    init: function () {
        scrollCtrl.add({
            el: document.getElementById('search-wrap'),
            fn: {
                0: function (percent, index) {
                    return transformStyle({
                        translateY: 140 + Math.round(Page.height * percent),
                    });
                },

                1: function (percent, index) {
                    return transformStyle({
                        translateY: 140 + Math.round(Page.height),
                        opacity: 1 - percent,
                    });
                }
            }
        });
    }
};

function navEnterClicker() {
    var nav = this.parentNode;
    nav.className = nav.className === 'nav-active' ? '' : 'nav-active';
}
document.getElementById('nav').onclick = navEnterClicker;

var scrollCtrl = {
    items: [],
    index: 0,
    leaveListeners: {},
    enterListeners: {},

    init: function () {
        
    },

    add: function (item) {
        this.items.push(item);
    },

    refreshView: function (isInit) {
        var scrollTop = document.body.scrollTop;
        var pageIndex = Math.floor(scrollTop / Page.height);
        var pageOffset = scrollTop - Page.height * pageIndex;
        var pageOffsetPercent = pageOffset / Page.height;

        this.realIndex = pageIndex;
        this.realOffset = pageOffsetPercent;

        if (isInit) {
            var index = pageIndex;
            if (pageOffsetPercent > 0.5) {
                index++;
            }

            if (scrollCtrl.index !== index) {
                scrollCtrl.fireLeave(scrollCtrl.index);
                scrollCtrl.index = index;
                scrollCtrl.fireEnter(scrollCtrl.index);
            }
        }
        else if (pageOffsetPercent > 0.7 && scrollCtrl.index === pageIndex) {
            scrollCtrl.index = pageIndex + 1;
            scrollCtrl.fireLeave(pageIndex);
            scrollCtrl.fireEnter(scrollCtrl.index);
        }
        else if (pageOffsetPercent < 0.3 && scrollCtrl.index > pageIndex) {
            scrollCtrl.index = pageIndex;
            scrollCtrl.fireLeave(pageIndex + 1);
            scrollCtrl.fireEnter(pageIndex);
        }

        for (var i = 0; i < scrollCtrl.items.length; i++) {
            var item = scrollCtrl.items[i];
            var fn = item.fn[pageIndex];

            if (typeof fn === 'function') {
                var styles = fn.call(item, pageOffsetPercent, pageIndex);
                setStyles(item.el, styles);
            }
        }
    },

    whenLeave: function (index, fn) {
        var listeners = scrollCtrl.leaveListeners;
        if (!listeners[index]) {
            listeners[index] = [];
        }

        listeners[index].push(fn);
    },

    fireLeave: function (index) {
        var listeners = scrollCtrl.leaveListeners[index];
        if (listeners instanceof Array) {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].call(scrollCtrl);
            }
        }
    },

    whenEnter: function (index, fn) {
        var listeners = scrollCtrl.enterListeners;
        if (!listeners[index]) {
            listeners[index] = [];
        }

        listeners[index].push(fn);
    },

    fireEnter: function (index) {
        var listeners = scrollCtrl.enterListeners[index];
        if (listeners instanceof Array) {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].call(scrollCtrl);
            }
        }
    }
};

function animation(fn) {
    var step = 0;
    var steps = 50;
    doStep();

    function doStep() {
        step ++;
        if (step > steps) {
            return;
        }

        var percent = step / steps;
        fn(percent);

        setTimeout(doStep, 4);
    }
}

var transition = {
    show: function (el) {
        animation(function (percent) {
            el.style.opacity = percent;
        });
    },

    hide: function (el) {
        animation(function (percent) {
            el.style.opacity = 1 - percent;
        });
    }
};


function SectionView(main, pageIndex) {
    var sections = main.getElementsByTagName('section');
    this.sections = sections;
    this.iphoneSections = [];

    this.len = sections.length;
    for (var i = 0; i < this.len; i++) {
        var section = sections[i];
        if (section.id.indexOf('home') >= 0) {
            this.homeIndex = i;
            this.currentIndex = i;
            section.style.opacity = 1;
        }

        var iphoneSection = null;
        each(
            section.getElementsByTagName('div'),
            function (div) {
                if (div.className === 'iphone-content') {
                    iphoneSection = div;
                }
            }
        );
        this.iphoneSections.push(iphoneSection);
    }

    var ctrlEl = document.createElement('div');
    ctrlEl.className = 'section-ctrl'
    main.parentNode.appendChild(ctrlEl);

    var iphoneSections = this.iphoneSections;
    var me = this;
    scrollCtrl.whenEnter(pageIndex, function () {
        me.currentIphoneSections = [];

        each(iphoneSections, function (iphoneSection) {
            var el = iphoneSection.cloneNode(true);
            el.style.display = 'block';
            me.currentIphoneSections.push(el);
            iphoneCtrl.addContent(el);
        });
        transition.show(me.currentIphoneSections[me.currentIndex]);
        transition.show(ctrlEl);
    });

    scrollCtrl.whenLeave(pageIndex, function () {
        iphoneCtrl.cleanScreen();
        transition.hide(ctrlEl);
    });

    var ctrlHtmlEl = document.getElementById('section-ctrl-btn');
    ctrlEl.innerHTML = ctrlHtmlEl.textContent || ctrlHtmlEl.innerText;

    var btns = ctrlEl.getElementsByTagName('svg');
    this.prevBtn = btns[0];
    this.nextBtn = btns[1];
    btns[0].onclick = prevSection(this);
    btns[1].onclick = nextSection(this);
}

SectionView.prototype.updateBtnState = function () {
    this.prevBtn.style.display = this.currentIndex <= 0 ? 'none' : '';
    this.nextBtn.style.display = this.currentIndex >= this.len - 1 ? 'none' : '';
};

SectionView.prototype.next = function () {
    var from = this.currentIndex;
    var to = from + 1;
    var fromEl = this.sections[from];
    var toEl = this.sections[to];

    if (to < this.len) {
        transition.hide(this.currentIphoneSections[from]);
        this.currentIndex = to;
        transition.show(this.currentIphoneSections[to]);
        this.updateBtnState();

        animation(function (percent) {
            percent = Math.sqrt(percent);

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
        });
    }
};

SectionView.prototype.prev = function () {
    var from = this.currentIndex;
    var to = from - 1;
    var fromEl = this.sections[from];
    var toEl = this.sections[to];

    if (to >= 0) {
        transition.hide(this.currentIphoneSections[from]);
        this.currentIndex = to;
        transition.show(this.currentIphoneSections[to]);
        this.updateBtnState();

        animation(function (percent) {
            percent = Math.sqrt(percent);

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
        });
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

function each(array, iterator) {
    if (array && array.length > 0) {
        for (var i = 0, l = array.length; i < l; i++) {
            iterator.call(array, array[i], i);
        }
    }
}

setTimeout(function () {
    new SectionView(document.getElementById('airmatter-main'), 2);
    new SectionView(document.getElementById('service-main'), 3);
    iphoneCtrl.init();
    mapCtrl.init();
    searchCtrl.init();
    scrollCtrl.init();

    if (document.body.scrollTop <= 10) {
        document.body.scrollTop = Page.height;
    }
    iphoneCtrl.el.style.opacity = 1;
    scrollCtrl.refreshView(true);

    window.onresize = resizeHandler;
    window.onscroll = scrollHandler;
}, 0);

function resizeHandler() {
    calcPageSize();
    document.body.scrollTop = (scrollCtrl.realIndex + scrollCtrl.realOffset) * Page.height;
}

function scrollHandler() {
    scrollCtrl.refreshView()
}

