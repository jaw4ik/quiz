define(['plugins/router', 'plugins/http', 'configuration/settings', 'repositories/questionRepository', 'eventManager'],
    function (router, http, settings, questionRepository, eventManager) {
        "use strict";

        var ctor = function (question, index, questionsCount) {
            var that = this;

            that.id = question.id;
            that.objectiveId = question.objectiveId;
            that.index = index;
            that.questionsCount = questionsCount;
            that.title = question.title;
            that.hasContent = question.hasContent;
            that.content = '';
            that.answers = [];

            that.activate = function () {
                return Q.fcall(function () {
                    that.answers = _.map(question.answers, function (answer) {
                        return {
                            id: answer.id,
                            image: answer.image
                        };
                    });

                    if (question.selectedAnswer) {
                        that.selectedOption(_.find(that.answers, function (answer) {
                            return answer.id == question.selectedAnswer;
                        }));
                    }

                    if (that.hasContent) {
                        return that.loadQuestionContent();
                    }
                });
            };


            that.selectedOption = ko.observable();
            that.selectOption = function (item) {
                that.selectedOption(item);
                that.saveSelectedAnswer();
            };

            that.loadQuestionContent = function () {
                var contentUrl = 'content/' + that.objectiveId + '/' + that.id + '/content.html';
                return Q(http.get(contentUrl)).then(function (response) {
                    that.content = response;
                }).fail(function () {
                    that.content = settings.questionContentNonExistError;
                });
            };

            that.showLearningContents = function () {
                eventManager.navigatedToLearningContent(that.id);
                router.navigate('objective/' + that.objectiveId + '/question/' + that.id + '/learningContents');
            };

            that.submit = function () {
                var option = ko.utils.unwrapObservable(that.selectedOption);
                question.answer(option ? option.id : undefined);
            };

            that.saveSelectedAnswer = function () {
                var option = ko.utils.unwrapObservable(that.selectedOption);
                question.saveSelectedAnswer(option ? option.id : undefined);
            };
        };

        return ctor;

    }
);