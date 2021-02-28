const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
    name: 'quiz',
    description: 'Stuff for quizzes',
    usage: '`!dn quiz`',
    arguments: 'Yes arguments',

    execute(message, words) {
        let helpEmbed = new Discord.MessageEmbed();
        helpEmbed.setTitle("!dn quiz help");
        helpEmbed.addField("`!dn quiz help`", "display all commands in the `quiz` family");
        helpEmbed.addField("`!dn quiz new quiz`", "starts the process of making a new quiz in your guild");
        helpEmbed.addField("`!dn quiz list [quiz title]`", "lists available quizzes or the questions in a quiz")
        helpEmbed.addField("`!dn quiz start <time limit> <quiz title>`", "starts <quiz title>, giving <time limit> seconds per question");
        helpEmbed.setColor("#602283");

        let data = require("../data/quiz.json");
        let userID = message.author.id;
        let guildID = message.channel.type === "dm" ? data.users[userID].lastguild : message.channel.guild.id;

        if (words[2] === undefined) {
            message.channel.send(helpEmbed);
            return;
        }
        switch (words[2].toUpperCase()) {

            case 'HELP':
                message.channel.send(helpEmbed);
                break;
            case 'NEW':
                if (words[3] === undefined) {
                    message.channel.send("Additional arguments expected. Try using `!dn quiz help` for more information.");
                }

                switch (words[3].toUpperCase()) {
                    case "QUIZ":
                        message.author.createDM().then(function (ch) {
                            ch.send("Creating a new quiz. Please enter the title of the quiz using `!dn quiz new title <title>`.");
                            // create object for user if doesn't exist
                            if (!data.users[userID])
                                data.users[userID] = {};
                            data.users[userID].lastguild = message.guild.id;
                            fs.writeFileSync("./data/quiz.json", JSON.stringify(data, null, 4));
                        });
                        break;

                    case "TITLE":
                        if (message.channel.type === "dm") {
                            if (words[4] === undefined) {
                                message.channel.send("Usage: `!dn quiz new title <title>`");
                            } else {
                                let quizTitle = words.slice(4).join(" ");

                                // create object for guild if doesn't exist
                                if (!data.quizzes[guildID])
                                    data.quizzes[guildID] = {};
                                if (data.quizzes[guildID][quizTitle]) {
                                    message.channel.send("Quiz already exists!");
                                } else {
                                    data.quizzes[guildID][quizTitle] = [];
                                    data.users[userID].lastquiz = quizTitle;
                                    fs.writeFileSync("./data/quiz.json", JSON.stringify(data, null, 4));
                                    message.channel.send("Created new quiz `" + quizTitle + "`\nAdd a question using `!dn quiz new question <question>`.");
                                }
                            }
                        } else {
                            message.channel.send("This command is meant to be used in a DM.");
                        }
                        break;

                    case "QUESTION":
                        if (message.channel.type === "dm") {
                            if (words[4] === undefined) {
                                message.channel.send("Usage: `!dn quiz new question <question>`");
                            } else {
                                let question = words.slice(4).join(" ");
                                let quizName = data.users[userID].lastquiz;

                                // todo: check if previous question has at least one answer
                                data.quizzes[guildID][quizName].push({
                                    question: question,
                                    answers: [],
                                    correct: undefined
                                });
                                fs.writeFileSync("./data/quiz.json", JSON.stringify(data, null, 4));
                                message.channel.send(`Added \`${question}\` to quiz \`${quizName}\`\nAdd answers to this question using \`!dn quiz new answer <answer>\``);
                            }
                        } else {
                            message.channel.send("This command is meant to be used in a DM.");
                        }
                        break;

                    case "ANSWER":
                        if (message.channel.type === "dm") {
                            if (words[4] === undefined) {
                                message.channel.send("Usage: `!dn quiz new answer <answer>`");
                            } else {
                                let answer = words.slice(4).join(" ");
                                let quizName = data.users[userID].lastquiz;
                                let question = data.quizzes[guildID][quizName].slice(-1)[0].question;

                                data.quizzes[guildID][quizName].slice(-1)[0].answers.push(answer);
                                fs.writeFileSync("./data/quiz.json", JSON.stringify(data, null, 4));
                                message.channel.send(`Added \`${answer}\` to question \`${question}\` in quiz \`${quizName}\`\nTo mark this question as correct, use \`!dn quiz new correct ${data.quizzes[guildID][quizName].slice(-1)[0].answers.length}\` or add another answer using \`!dn quiz new answer <answer>\`. To add another question, use \`!dn quiz new question <question>\`.`);
                            }
                        } else {
                            message.channel.send("This command is meant to be used in a DM.");
                        }
                        break;

                    case "CORRECT":
                        if (message.channel.type === "dm") {
                            if (words[4] === undefined) {
                                message.channel.send("Usage: `!dn quiz new correct <index>`");
                            } else {
                                // todo: check if given index actually points to an answer
                                let correctAnswerIndex = parseInt(words[4]) - 1;
                                let quizName = data.users[userID].lastquiz;
                                let question = data.quizzes[guildID][quizName].slice(-1)[0].question;
                                let answer = data.quizzes[guildID][quizName].slice(-1)[0].answers[correctAnswerIndex];

                                data.quizzes[guildID][quizName].slice(-1)[0].correct = correctAnswerIndex;
                                fs.writeFileSync("./data/quiz.json", JSON.stringify(data, null, 4));
                                message.channel.send(`Set the correct answer for \`${question}\` to \`${answer}\` in quiz \`${quizName}\``);
                            }
                        } else {
                            message.channel.send("This command is meant to be used in a DM.");
                        }
                        break;

                    default:
                        message.channel.send(`Invalid command \`${words[3]}\``);
                        break;
                }
                break;

            case 'SELECT':
                if (message.channel.type === "dm") {
                    if (words[3] === undefined) {
                        message.channel.send("Usage: `!dn quiz start <time limit> <quiz name>");
                    } else {
                        // todo: check if given index actually points to an answer
                        let quizName = words.slice(3).join(" ");

                        if (data.quizzes[guildID].hasOwnProperty(quizName)) {
                            data.users[userID].lastquiz = quizName;
                            fs.writeFileSync("./data/quiz.json", JSON.stringify(data, null, 4));
                            message.channel.send(`Set your selected quiz to \`${quizName}\``);
                        } else {
                            message.channel.send(`Quiz \`${quizName}\` does not exist.`);
                        }
                    }
                } else {
                    message.channel.send("This command is meant to be used in a DM.");
                }
                break;

            case 'LIST':
                if (words[3] === undefined) {
                    let availableQuizzes = new Discord.MessageEmbed();
                    availableQuizzes.setTitle("Available quizzes");
                    availableQuizzes.setColor("#602283");
                    for (let quiz in data.quizzes[guildID]) {
                        availableQuizzes.addField(quiz, "Number of questions: " + data.quizzes[guildID][quiz].length)
                    }
                    message.channel.send(availableQuizzes);
                } else {
                    if (message.channel.type === "dm") {
                        // todo: check if given index actually points to an answer
                        let quizName = words.slice(3).join(" ");

                        if (data.quizzes[guildID].hasOwnProperty(quizName)) {
                            let quizQuestions = new Discord.MessageEmbed();
                            quizQuestions.setTitle(quizName);
                            quizQuestions.setColor("#602283");
                            for (let question of data.quizzes[guildID][quizName]) {
                                let answers = "Answers:\n";
                                for (let i = 0; i < question.answers.length; i++) {
                                    answers += question.answers[i];
                                    answers += i === question.correct ? " (Correct)\n" : "\n";
                                }
                                quizQuestions.addField(question.question, answers)
                            }
                            message.channel.send(quizQuestions);
                        } else {
                            message.channel.send(`Quiz \`${quizName}\` does not exist.`);
                        }
                    } else {
                        message.channel.send("This command is meant to be used in a DM.");
                    }
                    break;
                }
                break;

            case 'DELETE':
                break;

            case 'START':
                if (words[4] === undefined) {
                    message.channel.send("Additional arguments expected. Try using `!dn quiz help` for more information.");
                } else {
                    const timeLimit = words[3];
                    let quizName = words.slice(4).join(" ");

                    if (data.quizzes[guildID].hasOwnProperty(quizName)) {
                        let quizLength = data.quizzes[guildID][quizName].length;
                        let questions = Array(quizLength * timeLimit).fill(null);
                        for (let i = 0; i < quizLength; i++) {
                            questions[i * timeLimit] = data.quizzes[guildID][quizName][i]
                        }
                        questions.push('END');
                        quizLoop(message, questions, 0, timeLimit, null, timeLimit);
                    } else {
                        message.channel.send(`Quiz \`${quizName}\` does not exist.`);
                    }
                }
                break;
            case 'BOARDS':
                break;
            default:
                message.channel.send(`Bad command \`${words[3]}\``);
                break;
        }
    }
};

function quizLoop(message, questions, i, timeLimit, questionMsgID, timeLeft) {
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (i < questions.length) {
        setTimeout(function () {
            if (questions[i] !== null) {
                if (i !== 0) {
                    let smartPeople = "";
                    message.channel.messages.cache.get(questionMsgID).reactions.cache.get(String.fromCodePoint(ALPHABET[questions[i - timeLimit].correct].codePointAt(0) + 127397)).users.cache.forEach(function(val) {
                        if (!val.bot)
                            smartPeople += val.username + "\n";
                    });
                    let answerMsg = new Discord.MessageEmbed();
                    answerMsg.setTitle("Time's up");
                    answerMsg.setDescription("The correct answer is (" + ALPHABET[questions[i - timeLimit].correct] + ") " + questions[i - timeLimit].answers[questions[i - timeLimit].correct]);
                    answerMsg.setColor("#602283");
                    if (!smartPeople) {
                        answerMsg.addField("Nobody is smart", ":cry:");
                    } else {
                        answerMsg.addField("The smart people", smartPeople)
                    }
                    message.channel.send(answerMsg);
                }
                if (i === questions.length - 1) {
                    // console.log("LAST ITEM");
                    // run stuff to print results
                } else {
                    let questionMsg = new Discord.MessageEmbed();
                    questionMsg.setTitle(questions[i].question);
                    questionMsg.setDescription("Answer by reacting to the next message!");
                    let answerField = "";
                    for (let ans in questions[i].answers) {
                        answerField += "(" + ALPHABET[ans] + ") ";
                        answerField += questions[i].answers[ans] + "\n";
                    }
                    questionMsg.addField("Answer Choices", answerField);
                    questionMsg.setThumbnail("https://media.discordapp.net/attachments/802619145065594922/815475660587532319/unknown.png");
                    questionMsg.setColor("#602283");
                    message.channel.send(questionMsg);
                    message.channel.send("You have " + timeLimit + " seconds").then(function() {
                        questionMsgID = message.client.user.lastMessageID;
                        for (let ans in questions[i].answers) {
                            message.channel.messages.cache.get(questionMsgID).react(String.fromCodePoint(ALPHABET[ans].codePointAt(0) + 127397));
                        }
                        i++;
                        quizLoop(message, questions, i, timeLimit, questionMsgID, timeLimit - 1);
                    });
                }
            } else {
                // message.channel.messages.cache.get(questionMsgID).edit("Time remaining: " + timeLeft);
                i++;
                quizLoop(message, questions, i, timeLimit, questionMsgID, timeLeft - 1);
            }
        }, 1000);
    }
}
