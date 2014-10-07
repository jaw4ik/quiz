define([], function () {
    "use strict";

    return {
        execute: function () {
            ko.bindingHandlers.background = {
                init: function (element) {
                    $(element)
                        .css('background-position', '0 0')
                        .css('background-repeat', 'no-repeat');
                },
                update: function (element, valueAccessor) {
                    var value = valueAccessor();
                    if (value) {
                        var src = ko.utils.unwrapObservable(value);
                        var image = new Image();
                        image.src = src;

                        image.onload = function () {
                            $(element)
                                .css('background-image', 'url(' + src + ')')
                                .css('height', image.height)
                                .css('width', image.width);
                        }
                    }
                }
            };
        }
    };
});