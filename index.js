'use strict'

// Import the Real Time Messaging (RTM) client// from the Slack API in node_modules
const RtmClient = require('@slack/client').RtmClient
// The memory data store is a collection of useful functions we // can// include in our RtmClient
const MemoryDataStore = require('@slack/client').MemoryDataStore
// Import the RTM event constants from the Slack API
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
// Import the client event constants from the Slack API
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS

const slackConfig = require('./config.js')

const token = slackConfig.TOKEN

let slack = new RtmClient(token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
})

// Add an event listener for the RTM_CONNECTION_OPENED event, 
slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  // Get the user's name  
  let user = slack.dataStore.getUserById(slack.activeUserId)
  // Get the team's name  
  let team = slack.dataStore.getTeamById(slack.activeTeamId)
  // Log the slack team name and the bot's name, using ES6's   
  // template string syntax  
  console.log(`Connected to ${team.name} as ${user.name}`)

  let channels = getChannels(slack.dataStore.channels)

  let channelNames = channels.map((channel) => {
    return channel.name
  }).join(', ')

  console.log(`Currently in: ${channelNames}`)
  // log the members of the channel  
  channels.forEach((channel) => {

    let members = channel.members.map((id) => {
      return slack.dataStore.getUserById(id)
    })

    members = members.filter((member) => {
      return !member.is_bot
    })

    let memberNames = members.map((member) => {
      return member.name
      slack.sendMessage(`Hello ${memberNames}!`, channel.id)
    }).join(', ')

    console.log('Members of this channel: ', memberNames)
  // Send a greeting to everyone in the channel    
  })
})

// check auth
slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`)
})

// event 
slack.on(RTM_EVENTS.MESSAGE, (message) => {
  let user = slack.dataStore.getUserById(message.user)

  if (user && user.is_bot) {
    return
  }
  let channel = slack.dataStore.getChannelGroupOrDMById(message.channel)

  if (message.text) {
    let msg = message.text.toLowerCase()

    if (/(hello|hi) (bot|ardonbot)/g.test(msg)) {
      slack.sendMessage(`Hello to you too, ${user.name}!`, channel.id)
    }
  }
})

// Returns an array of all the channels the bot resides in
function getChannels (allChannels) {
  let channels = []
  // Loop over all channels  
  for (let id in allChannels) {
    // Get an individual channel    
    let channel = allChannels[id]
    // Is this user a member of the channel?    
    if (channel.is_member) {
      // If so, push it to the array      
      channels.push(channel)
    }
  }
  return channels
}

slack.start()
