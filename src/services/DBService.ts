import { DynamoDB } from 'aws-sdk'
import { Entity, Table } from 'dynamodb-toolbox'

const awsRegion = process.env.AWS_REGION_DYNAMO || ``
const DocumentClient = new DynamoDB.DocumentClient({ region: awsRegion})
const Incident = new Table({

    name: 'Incident',

    partitionKey: 'incident_id',

    DocumentClient
    })

const IncidentEntity = new Entity({
    name: 'Incident',

    attributes: {
        incident_id: { partitionKey: true , type: 'string' }, 
        slack_ts: { type: 'string' }
    },

    table: Incident
})

export default class DBService {
    
    async putItem(key: string, value: string){

        let incident = {
            incident_id: key,
            slack_ts: value
        }

        try{
            IncidentEntity.put(incident)
            console.log(`Incident ${incident.incident_id} - ${incident.slack_ts} created sucessfully!`)
        } catch(error) {
            console.log(incident)
            console.error(error)
            throw(new Error('Couldn\'t create the item.'))
        }

    }

    async getItem(key: string){

        let incident = {
            incident_id: key
        }
        
        try{
            const response =  await IncidentEntity.get(incident)
            return response.Item
        } catch(error) {
            console.log(incident)
            console.error(error)
            throw(new Error('Couldn\'t get the item.'))
        }

    }
}