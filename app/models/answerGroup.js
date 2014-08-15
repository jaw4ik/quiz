define([],
    function () {

        function AnswerGroup(spec) {
            this.id = spec.id;
            this.answers = spec.answers;

            this.getCorrectText = getCorrectText;
            this.checkIsCorrect = checkIsCorrect;
        }

        function getCorrectText() {
            var correctAnswers = _.where(this.answers, {
                isCorrect: true
            });
            return _.map(correctAnswers, function (answer) {
                return answer.text;
            });
        }

        function checkIsCorrect(answerGroupValue) {
            return _.some(this.answers, function (answer) {
                return answer.text == answerGroupValue.value && answer.isCorrect;
            });
        }

        return AnswerGroup;
    }
);