define(['plugins/http', 'eventManager', 'repositories/questionRepository', 'plugins/router'], function (http, eventManager, questionRepository, router) {
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
        that.answerGroups = [];

        that.activate = function () {
            return Q.fcall(function () {
                that.answerGroups = _.map(question.answerGroups, function (answerGroup) {
                    var savedAnswerGroup = _.find(question.selectedAnswerGroups, function (selectedAnswerGroup) { return selectedAnswerGroup.id === answerGroup.id; });
                    return {
                        id: answerGroup.id,
                        answers: answerGroup.answers,
                        value: _.isNullOrUndefined(savedAnswerGroup) ? '' : savedAnswerGroup.value,
                        isAnswered: ko.observable(!_.isNullOrUndefined(savedAnswerGroup))
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
            eventManager.navigatedToLearningContent(that.id);
            router.navigate('objective/' + that.objectiveId + '/question/' + that.id + '/learningContents');
        };

        that.submit = function () {
            var question = questionRepository.get(that.objectiveId, that.id);
            question.answer(that.answerGroups);
        };

        that.saveSelectedAnswerGroups = function () {
            var selectedAnswers = _.map(that.answerGroups, function(answerGroup) {
                return { id: answerGroup.id, value: answerGroup.value, isAnswered: answerGroup.isAnswered() };
            });

            var question = questionRepository.get(that.objectiveId, that.id);
            question.saveSelectedAnswerGroups(selectedAnswers);
        };

    };

    return ctor;

});