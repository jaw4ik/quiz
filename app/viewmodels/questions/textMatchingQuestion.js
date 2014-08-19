define(['plugins/http', 'views/questions/helpers/textMatchingQuestion', 'eventManager', 'plugins/router'], function (http, viewHelper, eventManager, router) {
    "use strict";

    var ctor = function (question, index, questionsCount) {
        var
            that = this,
            values = _.chain(question.answers)
                .map(function (answer) {
                    return answer.value;
                })
                .shuffle()
                .value()
        ;

        that.id = question.id;
        that.objectiveId = question.objectiveId;
        that.index = index;
        that.questionsCount = questionsCount;
        that.title = question.title;
        that.hasContent = question.hasContent;
        that.content = '';
        that.sources = [];
        that.targets = [];

        that.activate = function () {
            return Q.fcall(function () {

                that.sources = _.map(question.answers, function (answer) {
                    var source = new Source(answer.id, answer.key);

                    var savedAnswer = _.find(question.selectedAnswers, function (selectedAnswer) {
                        return selectedAnswer.id == answer.id;
                    });
                    if (!_.isNullOrUndefined(savedAnswer)) {
                        source.value(savedAnswer.value);
                    }

                    return source;
                });

                that.targets = _.map(values, function (value) {
                    return new Target(value);
                });

                _.each(question.selectedAnswers, function (savedAnswer) {
                    var targetToReject = _.find(that.targets, function (target) {
                        return target.value() == savedAnswer.value;
                    });
                    targetToReject.rejectValue();
                });

                _.each(that.targets, function (target) {
                    target.value.subscribe(function () {
                        that.saveSelectedAnswers();
                    });
                });

            }).then(loadContent);
        };

        that.submit = function () {
            question.answer(_.map(that.sources, function (source) {
                return { id: source.id, value: ko.utils.unwrapObservable(source.value) };
            }));
        };

        that.isReady = ko.observable(false);
        that.compositionComplete = function (view) {
            viewHelper(view);
            that.isReady(true);
        };

        that.saveSelectedAnswers = function () {
            var answers = _.chain(that.sources)
                .map(function (source) {
                    return {
                        id: source.id,
                        value: ko.utils.unwrapObservable(source.value)
                    };
                })
                .filter(function (answer) {
                    return !_.isNullOrUndefined(answer.value);
                })
                .value();
            question.saveSelectedAnswers(answers);
        };

        that.showLearningContents = function () {
            eventManager.navigatedToLearningContent(that.id);
            router.navigate('objective/' + that.objectiveId + '/question/' + that.id + '/learningContents');
        };

        function loadContent() {
            if (that.hasContent) {
                var contentUrl = 'content/' + that.objectiveId + '/' + that.id + '/content.html';
                return Q(http.get(contentUrl)).then(function (response) {
                    that.content = response;
                }).fail(function () {
                    that.content = settings.questionContentNonExistError;
                });
            }
            return undefined;
        };

    };

    return ctor;


    function Source(id, key) {
        this.id = id;
        this.key = key;
        this.value = ko.observable();

        this.acceptValue = function (value) {
            this.value(value);
        }
        this.rejectValue = function () {
            this.value(null);
        }
    }

    function Target(value) {
        this.value = ko.observable(value);
        this.acceptValue = function (value) {
            this.value(value);
        }
        this.rejectValue = function () {
            this.value(null);
        }
    }

});