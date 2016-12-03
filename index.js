'use strict'

const slackConfig = require('./config.js')
const RtmClient = require('@slack/client').RtmClient
const MemoryDataStore = require('@slack/client').MemoryDataStore
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS

const token = slackConfig.TOKEN

let slack = new RtmClient(token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
})

slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {

  // get user name
  let user = slack.dataStore.getTeamById(slack.activeTeamId)

  // get the team's name  
  let team = slack.dataStore.getTeamById(slack.activeTeamId)

  console.log(`Connected to ${team.name} as ${user.name}`)

  let channels = getChannels(slack.dataStore.channels)

  let channelNames = channels.map((channel) => {
    return channel.name
  }).join(', ')

  console.log(`currently in: ${channelNames}`)

  // log all members of the channel
  channels.forEach((channel) => {
    // get the members by ID using the data store's
    let members = channel.members.map((id) => {
      return slack.dataStore.getUserById(id)
    })

    let memberNames = members.map((member) => {
      return member.name
    }).join(', ')
    console.log('members of this channel are: ', memberNames)
    // Test Hello World
    slack.sendMessage(`Hello ${memberNames}!`, channel.id)
  })
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
