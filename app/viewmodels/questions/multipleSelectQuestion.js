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
                            text: answer.text,
                            isChecked: ko.observable(_.contains(question.selectedAnswers, answer.id)),
                            toggleCheck: function () {
                                this.isChecked(!this.isChecked());
                                that.saveSelectedAnswers();
                            }
                        };
                    });

                    if (that.hasContent) {
                        return that.loadQuestionContent();
                    }
                });
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
                eventManager.navigatedToLearningContent(this.id);
                router.navigate('objective/' + that.objectiveId + '/question/' + that.id + '/learningContents');
            };

            that.submit = function () {
                var selectedAnswers = getSelectedAnswers();
                var question = questionRepository.get(that.objectiveId, that.id);
                question.answer(selectedAnswers);
            };

            that.saveSelectedAnswers = function() {
                var selectedAnswers = getSelectedAnswers();
                var question = questionRepository.get(that.objectiveId, that.id);

                question.saveSelectedAnswers(selectedAnswers);
            };

            function getSelectedAnswers() {
                return _.chain(that.answers).map(function (answer) {
                    if (answer.isChecked()) {
                        return answer.id;
                    }
                }).filter(function (answer) {
                    return !_.isNullOrUndefined(answer);
                }).value();
            }
        };

        return ctor;

    }
);