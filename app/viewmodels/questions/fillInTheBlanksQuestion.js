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
        that.answers = [];

        that.activate = function () {
            return Q.fcall(function () {
                that.answers = _.map(question.answers, function (answer) {
                    var savedAnswer = _.find(question.selectedAnswers, function (selectedAnswer) { return selectedAnswer.id === answer.id; });
                    return {
                        id: answer.id,
                        groupId: answer.group,
                        value: _.isNullOrUndefined(savedAnswer) ? '' : savedAnswer.value
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
            question.answer(that.answers);
        };

        that.saveSelectedAnswers = function () {
            var selectedAnswers = _.chain(that.answers)
                .filter(function (answer) {
                    return !_.isEmptyOrWhitespace(answer.value);
                })
                .map(function (answer) {
                    return { id: answer.id, value: answer.value };
                }).value();

            var question = questionRepository.get(that.objectiveId, that.id);
            question.saveSelectedAnswers(selectedAnswers);
        };

    };

    return ctor;

});