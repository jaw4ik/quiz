define(['durandal/app', 'plugins/router', 'eventManager', 'configuration/settings', 'repositories/questionRepository', 'repositories/courseRepository', 'constants',
    './questions/multipleSelectQuestion', './questions/singleSelectTextQuestion', './questions/fillInTheBlanksQuestion', './questions/dragAndDropTextQuestion',
    'models/questions/multipleSelectQuestion', 'models/questions/singleSelectTextQuestion', 'models/questions/fillInTheBlanksQuestion', 'models/questions/dragAndDropTextQuestion',
    'models/questions/singleSelectImageQuestion', 'viewmodels/questions/singleSelectImageQuestion', 'models/questions/textMatchingQuestion', 'viewmodels/questions/textMatchingQuestion'],
    function (app, router, eventManager, settings, questionRepository, courseRepository, constants,
        MultipleSelectQuestionViewModel, SingleSelectTextQuestionViewModel, FillInTheBlanksViewModel, DragAndDropTextQuestionViewModel,
        MultipleSelectQuestionModel, SingleSelectTextQuestionModel, FillInTheBlanksQuestionModel, DragAndDropTextQuestionModel, SingleSelectImageQuestionModel, SingleSelectImageQuestionViewModel,
        TextMatchingQuestionModel, TextMatchingQuestionViewModel) {
        "use strict";

        var viewModel = {
            courseTitle: '',
            totalQuestionsCount: 0,
            loadedQuestionsCount: 0,
            questions: ko.observableArray([]),
            isFullyLoaded: ko.observable(true),
            activeQuestionId: null,

            canActivate: canActivate,
            activate: activate,
            compositionComplete: compositionComplete,
            loadQuestions: loadQuestions,
            submit: submit
        };

        app.on(eventManager.events.navigatedToLearningContent, setActiveQuestion);
        app.on(eventManager.events.courseRestart, setInitialSettings);

        return viewModel;

        function canActivate() {
            var course = courseRepository.get();
            return !course.isAnswered();
        }

        function activate() {
            return Q.fcall(function () {
                var course = courseRepository.get();
                if (course == null) {
                    router.navigate('404');
                    return;
                }

                viewModel.courseTitle = course.title;
                viewModel.totalQuestionsCount = course.allQuestions.length;

                var mappedQuestions = _.chain(course.allQuestions).map(function (question, key) {
                    if (question instanceof MultipleSelectQuestionModel) {
                        return new MultipleSelectQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof SingleSelectTextQuestionModel) {
                        return new SingleSelectTextQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof FillInTheBlanksQuestionModel) {
                        return new FillInTheBlanksViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof DragAndDropTextQuestionModel) {
                        return new DragAndDropTextQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof SingleSelectImageQuestionModel) {
                        return new SingleSelectImageQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof TextMatchingQuestionModel) {
                        return new TextMatchingQuestionViewModel(question, key, course.allQuestions.length);
                    }
                }).filter(function (question) {
                    return !_.isNullOrUndefined(question);
                }).value();

                viewModel.questions(mappedQuestions);
            });
        }

        function submit() {
            _.each(viewModel.questions(), function (question) {
                question.submit();
            });
            router.navigate('summary');
        }

        function setActiveQuestion(eventArgs) {
            viewModel.activeQuestionId = eventArgs.questionId;
        }

        function setInitialSettings() {
            viewModel.questions([]);
            viewModel.isFullyLoaded(true);
            viewModel.activeQuestionId = null;
            viewModel.loadedQuestionsCount = 0;
        }

        function compositionComplete() {
            if (_.isNull(viewModel.activeQuestionId)) {
                return;
            }
            var targetTopPosition = jQuery('#' + viewModel.activeQuestionId).offset().top;
            jQuery('html, body').animate({
                scrollTop: targetTopPosition - 5
            });

            viewModel.activeQuestionId = null;
        }

        function loadQuestions() {
            var questionsToLoadContent = [],
                questionsToLoadCount = loadedQuestionsCount + settings.loadingQuestionsInStepCount;

            for (var i = loadedQuestionsCount; i < questionsToLoadCount; i++) {
                if (i > allQuestions.length - 1) {
                    isFullyLoaded(true);
                    break;
                }

                questionsToLoadContent.push(allQuestions[i]);
                loadedQuestionsCount++;
            }

            return questionRepository.loadQuestionContentCollection(questionsToLoadContent).then(function (questions) {
                var mappedQuestions = _.chain(questions).map(function (question, key) {
                    if (question instanceof MultipleSelectQuestionModel) {
                        return new MultipleSelectQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof SingleSelectTextQuestionModel) {
                        return new SingleSelectTextQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof FillInTheBlanksQuestionModel) {
                        return new FillInTheBlanksViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof DragAndDropTextQuestionModel) {
                        return new DragAndDropTextQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof SingleSelectImageQuestionModel) {
                        return new SingleSelectImageQuestionViewModel(question, key, course.allQuestions.length);
                    } else if (question instanceof TextMatchingQuestionModel) {
                        return new TextMatchingQuestionViewModel(question, key, course.allQuestions.length);
                    }
                }).filter(function (question) {
                    return !_.isNullOrUndefined(question);
                }).value();

                viewModel.questions.push(mappedQuestions);
            });
        }
    }
);