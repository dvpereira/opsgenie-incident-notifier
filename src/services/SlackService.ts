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

    async notify (hook: Hook) {
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

    async getThreadTs (incident_id: string){
        try {
            console.log(`Trying to get incident: ${incident_id}`)
            let response = await db.getItem(incident_id)
            console.log(`Slack Thread TS returned: ${response[`slack_ts`]}`)
            return response['slack_ts']
        } catch (error) {
            console.error(error)
            console.log(incident_id)
            return null
        }  
    }

    async sendParent (hook: Hook) {
        {
            try{
                var opsGenieIncident = await opsGenieController.getIncident(hook.alert.details['incident-id'])

                let serviceNames = new Array()
                //let teamName = ``

                for (const service of opsGenieIncident.data.impactedServices) {
                    const opsGenieService = await opsGenieController.getService(service)
                    //tags.push(opsGenieService.data.tags)
                    serviceNames.push(opsGenieService.data.name)
                    //teamName = (await opsGenieController.getTeam(opsGenieService.data.teamId)).data.name
                }

                var existing_threadTS = await this.getThreadTs(hook.alert.details['incident-id'])
                console.log(`Existing Thread_TS ${existing_threadTS}`)

                if(existing_threadTS == null){
                    var res = await slack.chat.postMessage({ 
                        channel: channel_id,
                        text: 'Novo incidente criado:',
                        blocks:[
                            {
                                type:"section", text: {
                                    type:'mrkdwn', text:`*Novo Incidente*:\n*<${opsgenieBaseURL}${hook.alert.details['incident-id']}|${hook.alert.tinyId} - ${hook.alert.message}>*`
                                }
                            },
                            {
                                type:"section", fields: [
                                    {
                                        type: 'mrkdwn', text: `*Prioridade:*\n${hook.alert.priority}`
                                    },
                                    {
                                        type: 'mrkdwn', text: `*Propriedades:*\n${JSON.stringify(hook.alert.details)}`
                                    },
                                    {
                                        type: 'mrkdwn', text: `*Time:*\n${hook.alert.team}`
                                    },
                                    {
                                        type: 'mrkdwn', text: `*Serviço(s):*\n${serviceNames}`
                                    }
                                ]
                            }
                        ],
                    }
                );
    
                    if(res.ts) {
                        console.log(`Parent message has been sent...`)
                        await db.putItem(hook.alert.details['incident-id'], res.ts)
                        await this.sendThread(hook, channel_id, res.ts,  `${hook.alert.description || `Thread criada...`}`)
                        console.log(`Incident has been saved on db...`)
                    }
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
                    message = `Boa! ${hook.alert.username} já está atuando neste incidente!`
                } else if(hook.alert.details['incident-alert-type'] == 'Owner') {
                    message = `Boa! ${hook.alert.username} já deu Acknowledge no alerta principal!`
                } else {
                    message = `Boa! ${hook.alert.username} já está atuando neste incidente!`
                }
                
                break;
            }
            case 'AddNote': {
                message = `${hook.alert.username} postou o seguinte comentário no incidente: "${hook.alert.note}"`
                break;
            }
            case 'Close': {
                if(hook.alert.details['incident-alert-type'] == 'Associated') {
                    message = `${hook.alert.username} fechou o alerta associado!`
                } else if(hook.alert.details['incident-alert-type'] == 'Owner') {
                    message = `${hook.alert.username} fechou o alerta principal!`
                } else {
                    message = `Bom trabalho! Este incidente foi resolvido!`
                }

                break;
            }
        }
        return message
        
    }

    shouldNotifyParent (hook: Hook): boolean{

        return hook.action == 'Create' && 
            (
                hook.alert.details['incident-alert-type'] == 'Owner'
                // || hook.alert.details['incident-alert-type'] == 'Responder'
            ) &&
                hook.alert.details['incident-id'] != null &&
                !this.muteByTags(hook.alert.tags)
    }

    shouldNotifyThread (hook: Hook): boolean{

        return (
                hook.action == 'Acknowledge' || 
                hook.action == 'AddNote' || 
                hook.action == 'Close'
            ) && 
            (
                hook.alert.details['incident-alert-type'] == 'Responder' || 
                hook.alert.details['incident-alert-type'] == 'Associated' ||
                hook.alert.details['incident-alert-type'] == 'Owner'
            ) &&
                hook.alert.details['incident-id'] != null &&
                !this.muteByTags(hook.alert.tags)
    }

    muteByTags (tags: String[]): boolean{
        for (let tag of tags)
            if(tag == 'mute'){
                return true          
        }

        return false
    }
}

export default SlackService;