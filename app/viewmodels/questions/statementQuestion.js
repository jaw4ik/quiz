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
                        var selectedStatement = _.find(question.selectedStatements, function(item) {
                             return item.id == statement.id;
                        });

                        return {
                            id: statement.id,
                            text: statement.text,
                            isTrueChecked: ko.observable(_.isNullOrUndefined(selectedStatement) ? false : selectedStatement.state == true),
                            isFalseChecked: ko.observable(_.isNullOrUndefined(selectedStatement) ? false : selectedStatement.state == false),
                            setTrue: function () {
                                this.isTrueChecked(true);
                                this.isFalseChecked(false);
                                that.saveSelectedStatements();
                            },
                            setFalse: function () {
                                this.isTrueChecked(false);
                                this.isFalseChecked(true);
                                that.saveSelectedStatements();
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
                var selectedStatements = getSelectedStatements();
                var question = questionRepository.get(that.objectiveId, that.id);
                question.answer(selectedStatements);
            };

            that.saveSelectedStatements = function () {
                var selectedStatements = getSelectedStatements();
                var question = questionRepository.get(that.objectiveId, that.id);

                question.saveSelectedStatements(selectedStatements);
            };

            function getSelectedStatements() {
                return _.chain(that.statements).map(function (statement) {
                    if (statement.isTrueChecked()) {
                        return { id: statement.id, state: true };
                    } else if (statement.isFalseChecked()) {
                        return { id: statement.id, state: false };
                    }
                }).filter(function (statement) {
                    return !_.isNullOrUndefined(statement);
                }).value();
            }
        };

        return ctor;

    }
);