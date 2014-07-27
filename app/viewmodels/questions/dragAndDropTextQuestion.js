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
        that.background = question.background;
        that.dropspots = [];
        that.texts = [];

        that.activate = function () {
            return Q.fcall(function () {
                that.texts = _.map(question.dropspots, function (dropspot) {
                    return {
                        id: dropspot.id,
                        text: dropspot.text
                    };
                });

                that.dropspots = _.map(question.dropspots, function (dropspot) {
                    var dropspotModel = {
                        id: dropspot.id,
                        x: dropspot.x,
                        y: dropspot.y,
                        text: ko.observable()
                    };

                    var savedAnswer = _.find(question.placedAnswers, function(answer) {
                        return answer.dropspotId === dropspot.id;
                    });
                    
                    if (!_.isNullOrUndefined(savedAnswer)) {
                        dropspotModel.text(_.find(that.texts, function(text) {
                             return text.id == savedAnswer.id;
                        }));
                    }

                    dropspotModel.text.subscribe(function () {
                        that.savePlacedAnswers();
                    });

                    return dropspotModel;
                });
            });
        };
        
        that.showLearningContents = function () {
            eventManager.navigatedToLearningContent(that.id);
            router.navigate('objective/' + that.objectiveId + '/question/' + that.id + '/learningContents');
        };

        that.submit = function () {
            var answers = getPlacedAnswers();
            var question = questionRepository.get(that.objectiveId, that.id);
            question.answer(answers);
        };

        that.savePlacedAnswers = function() {
            var answers = getPlacedAnswers();
            var question = questionRepository.get(that.objectiveId, that.id);
            question.savePlacedAnswers(answers);
        };

        function getPlacedAnswers() {
            return _.chain(that.dropspots)
                .filter(function(dropspot) {
                    return dropspot.text();
                })
                .map(function(dropspot) {
                    return {
                        dropspotId: dropspot.id,
                        id: dropspot.text().id,
                        x: dropspot.x,
                        y: dropspot.y
                    };
                })
                .value();
        }

    };

    return ctor;

});