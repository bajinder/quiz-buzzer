exports.Room = function (room,hostSocketID) {
    this.hostSocketID=hostSocketID;
    this.players=[];
    this.questions=[];
    this.currentQuestion=0;
    this.buzzerSequence=[];
    this.answeredQuestions=[];
}

exports.Player= function(playerSocketID,player){
    this.playerSocketID=playerSocketID;
    this.playerID=player._id;
    this.playerName=player.StudentName;
    this.quizScore=0;
}

exports.Question=function(question){
    this.question=question.question;
    this.optionA=question.optA;
    this.optionB=question.optB;
    this.optionC=question.optC;
    this.optionD=question.optD;
    this.answer=question.answer;
}
