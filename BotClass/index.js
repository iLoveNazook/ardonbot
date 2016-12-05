'use strict';

let Bot = require('./Bot');

const bot = new Bot({
    token: process.env.SLACK_TOKEN,
    autoReconnect: true,
    autoMark: true
});

bot.respondTo('hello', (message, channel, user) => {
    bot.send(`Hello to you too, ${user.name}! Don't be an asshole and you'll remain in the room.`, channel)
}, true);


//roll dice 
bot.respondTo('roll', (message, channel, user) => {

  const members = bot.getMembersByChannel(channel);

  if (!members) {
    bot.send('You have to challenge someone in a channel, not a direct message!', channel);
    return;
  }

  // get the arguments from the message body
  let args = getArgs(message.text);

  // if args is empty, return with a warning
  if (args.length < 1) {
    bot.send('You have to provide the name of the person you wish to challenge!', channel);
    return;
  }

  if (members.indexOf(args[0]) < 0) {
    bot.send(`Sorry ${user.name}, but I either can't find ${args[0]} in this channel, or they are a bot!`, channel);
    return;
  }

  // Roll two random numbers between 0 and 100
  let firstRoll = Math.round(Math.random() * 100);
  let secondRoll = Math.round(Math.random() * 100);

  let challenger = user.name;
  let opponent = args[0];

  while (firstRoll === secondRoll) {
    secondRoll = Math.round(Math.random() * 100);
  }

  let winner = firstRoll > secondRoll ? challenger : opponent;

  bot.send(
    `${challenger} fancies their changes against ${opponent}!\n
    ${challenger} rolls: ${firstRoll}\n
    ${opponent} rolls: ${secondRoll}\n\n
    *${winner} is the winner!*`
  , channel);

}, true);

// Take the message text and return the arguments
function getArgs(msg) {
  return msg.split(' ').slice(1);
}