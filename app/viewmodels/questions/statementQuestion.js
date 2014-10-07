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
            that.statements = [];

            that.activate = function () {
                return Q.fcall(function () {
                    that.statements = _.map(question.statements, function (statement) {
                        var answeredStatement = _.find(question.answeredStatements, function (item) {
                             return item.id == statement.id;
                        });

                        var statementViewModel = {
                            id: statement.id,
                            text: statement.text,
                            selectedState: ko.observable(_.isNullOrUndefined(answeredStatement) ? null : answeredStatement.state)
                        };

                        statementViewModel.isTrueChecked = ko.computed(function() {
                            return statementViewModel.selectedState() == true;
                        });

                        statementViewModel.isFalseChecked = ko.computed(function () {
                            return statementViewModel.selectedState() == false;
                        });

                        return statementViewModel;
                    });

                    if (that.hasContent) {
                        return that.loadQuestionContent();
                    }
                });
            };

            that.setTrue = function(statement) {
                statement.selectedState(true);
                that.saveAnsweredStatements();
            }

            that.setFalse = function (statement) {
                statement.selectedState(false);
                that.saveAnsweredStatements();
            }

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
                var answeredStatements = getAnsweredStatements();
                var question = questionRepository.get(that.objectiveId, that.id);
                question.answer(answeredStatements);
            };

            that.saveAnsweredStatements = function () {
                var answeredStatements = getAnsweredStatements();
                var question = questionRepository.get(that.objectiveId, that.id);

                question.saveAnsweredStatements(answeredStatements);
            };

            function getAnsweredStatements() {
                return _.chain(that.statements).map(function (statement) {
                    return { id: statement.id, state: statement.selectedState() };
                }).filter(function (statement) {
                    return !_.isNullOrUndefined(statement);
                }).value();
            }
        };

        return ctor;

    }
);