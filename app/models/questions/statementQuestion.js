define(['eventManager', 'repositories/objectiveRepository'], function (eventManager, objectiveRepository) {
    "use strict";

    var ctor = function (spec) {
        var that = this;

        that.id = spec.id;
        that.objectiveId = spec.objectiveId;
        that.title = spec.title;
        that.hasContent = spec.hasContent;
        that.statements = _.shuffle(spec.statements);
        that.selectedStatements = [];
        that.learningContents = spec.learningContents;

        that.isAnswered = false;
        that.isCorrectAnswered = false;
        that.score = 0;

        that.answer = function (selectedStatements) {
            that.isCorrectAnswered = true;
            for (var i = 0; i < that.statements.length; i++) {
                var statement = that.statements[i];
                var selected = _.find(selectedStatements, function (item) {
                    return item.id == statement.id;
                });

                if (_.isNullOrUndefined(selected) || selected.state != statement.isCorrect) {
                    that.isCorrectAnswered = false;
                    break;
                }
            }

            that.score = that.isCorrectAnswered ? 100 : 0;
            that.isAnswered = true;

            var objective = objectiveRepository.get(that.objectiveId);
            var eventData = {
                type: "choice",
                question: {
                    id: that.id,
                    title: that.title,
                    answers: _.map(that.statements, function (item) {
                        return {
                            id: item.id,
                            text: item.text
                        };
                    }),
                    score: that.score,
                    selectedStatements: selectedStatements,
                    correctStatements: that.statements
                },
                objective: {
                    id: objective.id,
                    title: objective.title
                }
            };
            eventManager.answersSubmitted(eventData);
        };

        that.saveSelectedStatements = function (selectedStatements) {
            that.selectedStatements = selectedStatements;
        };

        that.resetProgress = function () {
            that.isAnswered = false;
            that.isCorrectAnswered = false;
            that.score = 0;
            that.selectedAnswers = [];
        };
    };

    return ctor;

});