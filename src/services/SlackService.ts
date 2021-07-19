import { WebClient } from '@slack/web-api'
import OpsGenieService from './OpsGenieService'
import { Hook } from '../interfaces/Hook'
import DBService from './DBService'

const token = process.env.SLACK_TOKEN || ``
const channel_id = process.env.SLACK_CHANNEL_ID || ``
const opsgenieBaseURL = process.env.OPSGENIE_BASE_URL || ``
const slack = new WebClient(token)
const db = new DBService()
const opsGenieController = new OpsGenieService()

class SlackService {

    async notify(hook: Hook) {
        try{
            if (this.shouldNotifyParent(hook)) {
                console.log('Sending parent message...')
                console.log(JSON.stringify(hook))
                await this.sendParent(hook);
            } else if (this.shouldNotifyThread(hook)){
                console.log('Sending thread message...')
                let threadTs = await this.getThreadTs(hook.alert.details['incident-id'])
                await this.sendThread(hook, channel_id, threadTs, this.createThreadMessage(hook));
            } else {
                console.warn(`Unknown webhook received: ${JSON.stringify(hook)}`)
            }
        } catch (error){
            console.error(error)
            throw error
        }
        
    }

    async getThreadTs(incident_id: string){
        try {
            console.log(`Trying to get incident: ${incident_id}`)
            let response = await db.getItem(incident_id)
            console.log(`Slack Thread TS returned: ${response[`slack_ts`]}`)
            return response['slack_ts']
        } catch (error) {
            console.error(error)
            console.log(incident_id)
            throw error
        }  
    }

    async sendParent(hook: Hook) {
        {
            try{
                var opsGenieIncident = await opsGenieController.getIncident(hook.alert.details['incident-id'])

                //let tags = new Array()
                let serviceNames = new Array()

                for (const service of opsGenieIncident.data.impactedServices) {
                    const opsGenieService = await opsGenieController.getService(service)
                    //tags.push(opsGenieService.data.tags)
                    serviceNames.push(opsGenieService.data.name)
                }

                var res = await slack.chat.postMessage({ 
                    channel: channel_id,
                    text: 'New incident has been created',
                    blocks:[
                        {
                            type:"section", text: {
                                type:'mrkdwn', text:`*New Incident*:\n*<${opsgenieBaseURL}${hook.alert.details['incident-id']}|${hook.alert.tinyId} - ${hook.alert.message}>*`
                            }
                        },
                        {
                            type:"section", fields: [
                                {
                                    type: 'mrkdwn', text: `*Priority:*\n${hook.alert.priority}`
                                },
                                {
                                    type: 'mrkdwn', text: `*Extra Properties:*\n${JSON.stringify(hook.alert.details)}`
                                },
                                {
                                    type: 'mrkdwn', text: `*Team:*\n${hook.alert.team}`
                                },
                                {
                                    type: 'mrkdwn', text: `*Service(s):*\n${serviceNames}`
                                }
                            ]
                        }
                    ],
                }
            );

                if(res.ts) {
                    console.log(`Parent message has been sent...`)
                    await db.putItem(hook.alert.details['incident-id'], res.ts)
                    await this.sendThread(hook, channel_id, res.ts,  `${hook.alert.description || `Incident Thread Created.`}`)
                    console.log(`Incident has been saved on db...`)
                }
                    
            } catch(error){
                console.error(error)
                console.log(JSON.stringify(hook))
                throw error
            }
        }
    }

    async sendThread (hook: Hook, channel_id: string, thread_ts: string, message?: string) {
        try {
            await slack.chat.postMessage({ channel: channel_id, thread_ts: thread_ts, text: (message == null ? this.createThreadMessage(hook) : message)}); 
            console.log(`Thread Message has been sent: ${message}`) 
        } catch (error) {
            console.error(error)
            console.log(`HOOK: ${JSON.stringify(hook)} CHANNEL_ID: ${channel_id} THREAD_TS: ${thread_ts} MESSAGE: ${message}`)
            throw error
        }
    }

    createThreadMessage(hook: Hook): string {
        let message = ``

        switch (hook.action) {
            case 'Acknowledge': {
                if(hook.alert.details['incident-alert-type'] == 'Associated') {
                    message = `Nice! ${hook.alert.username} has acknowledged the Associated alert and is looking at this incident!`
                } else if(hook.alert.details['incident-alert-type'] == 'Owner') {
                    message = `Nice! ${hook.alert.username} has acknowledged the Owner alert and is looking at this incident!`
                } else {
                    message = `Nice! ${hook.alert.username} is already looking at this!`
                }
                
                break;
            }
            case 'AddNote': {
                message = `${hook.alert.username} posted a note to the incident: "${hook.alert.note}"`
                break;
            }
            case 'Close': {
                if(hook.alert.details['incident-alert-type'] == 'Associated') {
                    message = `${hook.alert.username} has Closed the Associated alert!`
                } else if(hook.alert.details['incident-alert-type'] == 'Owner') {
                    message = `${hook.alert.username} has Closed the Owner alert! This incident has been solved!`
                } else {
                    message = `Nice job! This incident has been solved!`
                }

                break;
            }
        }
        return message
        
    }

    shouldNotifyParent(hook: Hook): boolean{

        return hook.action == 'Create' && 
            hook.alert.details['incident-alert-type'] == 'Owner' &&
            hook.alert.details['incident-id'] != null
    }

    shouldNotifyThread(hook: Hook): boolean{

        return (hook.action == 'Acknowledge' || hook.action == 'AddNote' || hook.action == 'Close') && 
            (hook.alert.details['incident-alert-type'] == 'Responder' || 
                hook.alert.details['incident-alert-type'] == 'Associated' ||
                hook.alert.details['incident-alert-type'] == 'Owner') &&
            hook.alert.details['incident-id'] != null
    }
}

export default SlackService;